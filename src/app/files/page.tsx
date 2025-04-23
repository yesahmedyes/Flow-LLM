"use client";

import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { type FileData, useFilesStore } from "../stores/filesStore";
import UploadFileSection from "./_components/uploadFileSection";
import { api } from "~/trpc/react";
import Loader from "../_components/loader";
import FileCard from "./_components/fileCard";

export default function Page() {
  const user = useUser();

  const { files, addFiles, contentLoaded } = useFilesStore();

  const groupFilesByDate = (files: FileData[]) => {
    const grouped = files.reduce(
      (acc, file) => {
        const date = new Date(file.createdAt).toLocaleDateString();

        acc[date] ??= [];
        acc[date].push(file);
        return acc;
      },
      {} as Record<string, FileData[]>,
    );

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  const groupedFiles = useMemo(() => groupFilesByDate(files), [files]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = api.files.fetchFiles.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      enabled: !!user && !contentLoaded,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (data?.pages && data.pages.length > 0) {
      const n_pages = data.pages.length;

      const allFiles = data.pages[n_pages - 1]?.items ?? [];

      addFiles(allFiles);
    }
  }, [data]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = sentinelRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, [contentLoaded, fetchNextPage, isFetchingNextPage]);

  return (
    <div className="flex max-w-4xl mx-auto flex-col items-center py-20">
      {/* Upload Section */}
      <UploadFileSection />

      {/* Files Display Section */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-5">Your Files</h2>

        {contentLoaded ? (
          <>
            {groupedFiles.map(([date, dateFiles]) => (
              <div key={date} className="mb-6">
                <h3 className="text-sm mb-4">{date}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dateFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              </div>
            ))}
            {hasNextPage && (
              <div ref={sentinelRef}>
                <Loader className="pt-12" />
              </div>
            )}
          </>
        ) : (
          <Loader className="pt-8" />
        )}
      </div>
    </div>
  );
}
