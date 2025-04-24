import { UploadDropzone } from "~/lib/helpers/uploadThing";
import { useFilesStore } from "~/app/stores/filesStore";
import type { ClientUploadedFileData } from "uploadthing/types";
import { type FileData } from "~/app/stores/filesStore";
import { useMutation } from "@tanstack/react-query";

type UploadFileResponse = ClientUploadedFileData<{
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}>;

export default function UploadFileSection() {
  const { addFiles } = useFilesStore();

  const createEmbeddingsMutation = useMutation({
    mutationFn: async (obj: UploadFileResponse[]) => {
      const res = await fetch("/api/bg/createEmbeddings", {
        method: "POST",
        body: JSON.stringify(obj.map((file) => file.serverData)),
      });
    },
  });

  const handleUploadComplete = (res: UploadFileResponse[]) => {
    createEmbeddingsMutation.mutate(res);

    addFiles(
      res.map((file) => ({
        ...file.serverData,
        createdAt: new Date(file.serverData.createdAt),
        updatedAt: new Date(file.serverData.updatedAt),
      })),
    );
  };

  return (
    <div className="w-full mt-1.5 mb-10">
      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={handleUploadComplete}
        className="rounded-xl p-8 w-full border border-dashed"
        appearance={{
          container: "cursor-pointer bg-background",
          uploadIcon: "text-muted-foreground",
          label: "text-muted-foreground pt-4",
          allowedContent: "text-muted-foreground pt-2 pb-6",
          button: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 px-4 py-2 rounded-md",
        }}
      />
    </div>
  );
}
