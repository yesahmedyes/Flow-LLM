/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { type FileData, useFilesStore } from "../stores/filesStore";
import UploadFileSection from "./_components/uploadFileSection";
import { api } from "~/trpc/react";
import Loader from "../_components/loader";

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
                    <div key={file.id} className="border rounded-lg p-4 flex flex-col">
                      <div className="flex items-center mb-2">
                        <FileIcon type={file.fileType} />
                        <span className="ml-2 truncate">{file.fileName}</span>
                      </div>

                      {file.fileType.startsWith("image/") ? (
                        <div className="h-32 w-full overflow-hidden rounded-md mb-2">
                          <img src={file.fileUrl} alt={file.fileName} className="h-full w-full object-cover" />
                        </div>
                      ) : null}

                      <div className="mt-auto pt-2 flex justify-between">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </a>
                        <a
                          href={file.fileUrl}
                          download={file.fileName}
                          className="text-sm text-primary hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </div>
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

function FileIcon({ type }: { type: string }) {
  let icon = "";

  if (type.includes("image")) {
    icon = "🏞️";
  } else if (type.includes("text")) {
    icon = "📄";
  } else if (type.includes("pdf")) {
    icon = "📕";
  }

  return <span className="text-xl">{icon}</span>;
}
