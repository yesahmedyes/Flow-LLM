import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  url: string | null;
  status: "uploading" | "completed" | "error";
  xhr: XMLHttpRequest | null;
};

export type UploadedFile = {
  url: string;
  name: string;
  contentType: string;
};

export function useFileUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadedFilesRef = useRef<UploadedFile[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    const fileId = crypto.randomUUID();

    setUploadingFiles((prev) => [
      ...prev,
      {
        id: fileId,
        file,
        progress: 0,
        url: null,
        status: "uploading",
        xhr: null,
      },
    ]);

    try {
      const response = await fetch("/api/s3/presigned-url-temp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, fileUrl } = (await response.json()) as { presignedUrl: string; fileUrl: string };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, xhr } : f)));

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, status: "completed", url: fileUrl, progress: 100 } : f)),
            );

            uploadedFilesRef.current.push({ url: fileUrl, name: file.name, contentType: file.type });

            resolve();
          } else {
            setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)));
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)));
          reject(new Error("Upload failed"));
        };

        xhr.send(file);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadingFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)));
      toast.error(`Failed to upload ${file.name}`);
    }
  }, []);

  const handleFileSelect = useCallback(
    (fileType: "image" | "file") => {
      const input = document.createElement("input");
      input.type = "file";

      if (fileType === "image") {
        input.accept = "image/*";
      } else if (fileType === "file") {
        input.accept = ".pdf,.txt,.md";
      }

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file) {
            void uploadFile(file);
          }
        }
      };

      input.click();
    },
    [uploadFile],
  );

  const cancelUpload = useCallback((fileId: string) => {
    setUploadingFiles((prev) => {
      const updatedFiles = prev.map((f) => {
        if (f.id === fileId) {
          if (f.xhr) f.xhr.abort();

          return { ...f, status: "error" as const };
        }
        return f;
      });

      setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));

      return updatedFiles;
    });
  }, []);

  const removeUploadedFile = useCallback(
    (fileId: string) => {
      setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));

      const fileToRemove = uploadingFiles.find((f) => f.id === fileId);

      if (fileToRemove?.url) {
        uploadedFilesRef.current = uploadedFilesRef.current.filter((f) => f.url !== fileToRemove.url);
      }
    },
    [uploadingFiles],
  );

  const clearUploadedFiles = useCallback(() => {
    uploadedFilesRef.current = [];

    setUploadingFiles([]);
  }, []);

  const getUploadedFiles = useCallback(() => {
    return uploadedFilesRef.current.length > 0 ? uploadedFilesRef.current : undefined;
  }, []);

  const hasUploadingFiles = useCallback(() => {
    return uploadingFiles.some((file) => file.status === "uploading");
  }, [uploadingFiles]);

  return {
    uploadingFiles,
    uploadFile,
    handleFileSelect,
    cancelUpload,
    removeUploadedFile,
    clearUploadedFiles,
    getUploadedFiles,
    hasUploadingFiles,
  };
}
