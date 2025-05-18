import { useState, useCallback } from "react";
import { useUploadArea } from "../../../hooks/useUploadArea";
import { api } from "~/trpc/react";
import { DocumentUpload } from "iconsax-react";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";

export default function UploadFileSection() {
  const utils = api.useUtils();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addFilesMutation = api.files.addFiles.useMutation({
    onSuccess: () => {
      toast.success("File(s) uploaded successfully");

      void utils.files.fetchFiles.invalidate();
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const filesToUpload = [] as { fileUrl: string; fileName: string; fileType: string }[];

    try {
      for (const file of acceptedFiles) {
        const response = await fetch("/api/s3/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        const { presignedUrl, fileUrl } = (await response.json()) as { presignedUrl: string; fileUrl: string };

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);

              setUploadProgress(progress);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Upload failed"));
          };

          xhr.send(file);
        });

        filesToUpload.push({ fileUrl, fileName: file.name, fileType: file.type });
      }

      await addFilesMutation.mutateAsync({ fileUrls: filesToUpload });
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useUploadArea({ onDrop });

  return (
    <div className="w-full mt-1.5 mb-10">
      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
      <div
        {...getRootProps()}
        className={`rounded-xl h-60 px-8 place-content-center w-full border border-dashed cursor-pointer bg-background ${
          isDragActive ? "border-blue-500" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center cursor-pointer">
          {isUploading ? (
            <>
              <p className="text-muted-foreground">Uploading... {uploadProgress}%</p>
            </>
          ) : (
            <>
              <DocumentUpload className="h-9 w-9 stroke-muted-foreground" />
              <p className="text-muted-foreground pt-5 text-sm">
                {isDragActive
                  ? "Dropped files will be automatically uploaded"
                  : "Drop files here, or click to select files"}
              </p>
              <p className="text-muted-foreground pt-2 pb-6 text-sm">
                Supports images, PDFs, and text files up to 16MB
              </p>
              <Button variant="secondary" className="mt-1 font-normal">
                Select Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
