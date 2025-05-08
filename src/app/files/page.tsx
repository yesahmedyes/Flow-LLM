"use client";

import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { type FileData } from "~/lib/types/db-types";
import UploadFileSection from "./_components/uploadFileSection";
import { api } from "~/trpc/react";
import FileCard from "./_components/fileCard";
import CustomLoader from "../_components/customLoader";
import { ScrollArea } from "../_components/ui/scroll-area";

export default function Page() {
  const user = useUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = api.files.fetchFiles.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      enabled: !!user,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

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

  const groupedFiles = useMemo(() => groupFilesByDate(data?.pages.flatMap((page) => page.items) ?? []), [data]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !data) return;

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
  }, [fetchNextPage, isFetchingNextPage, user, data]);

  return (
    <div className="flex max-w-4xl mx-auto flex-col items-center py-20">
      <ScrollArea className="w-full">
        {/* Upload Section */}
        <UploadFileSection />

        {/* Files Display Section */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-5">Your Files</h2>

          {groupedFiles.length > 0 ? (
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
                  <CustomLoader className="pt-12" />
                </div>
              )}
            </>
          ) : (
            <>
              {isLoading && <CustomLoader className="pt-8" />}
              {!isLoading && <p className="text-center text-sm text-muted-foreground pt-8">No files uploaded yet</p>}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
