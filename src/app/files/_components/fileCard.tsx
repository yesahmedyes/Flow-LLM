/* eslint-disable @next/next/no-img-element */
import { EllipsisVertical } from "lucide-react";
import { Popover, PopoverTrigger } from "~/app/_components/ui/popover";
import { PopoverContent } from "~/app/_components/ui/popover";
import { type FileData } from "~/app/stores/filesStore";
import { api } from "~/trpc/react";
import { useFilesStore } from "~/app/stores/filesStore";
import { useDeleteDialog } from "~/app/_components/deleteDialog";
import { useEditDialog } from "~/app/_components/editDialog";
import { toast } from "sonner";

export default function FileCard({ file }: { file: FileData }) {
  // BUG: When a file is deleted, infinite query skips a file on next page.
  // TODO: Fix this.

  const { DeleteDialogComponent, setOpen: setDeleteDialogOpen } = useDeleteDialog();
  const { EditDialogComponent, setOpen: setEditDialogOpen } = useEditDialog();

  const { removeFile, updateFile } = useFilesStore();

  const deleteFileMutation = api.files.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
  });

  const updateFileNameMutation = api.files.updateFileName.useMutation({
    onSuccess: () => {
      toast.success("File name updated successfully");
    },
  });

  const handleDelete = async () => {
    try {
      void deleteFileMutation.mutateAsync({ id: file.id });

      removeFile(file.id);

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleEdit = async (newFileName: string) => {
    try {
      void updateFileNameMutation.mutateAsync({ id: file.id, name: newFileName });

      updateFile(file.id, { ...file, fileName: newFileName });

      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update file name:", error);
    }
  };

  return (
    <div
      onClick={() => {
        toast.success("File clicked");
      }}
      key={file.id}
      className="border rounded-lg p-4 flex flex-col"
    >
      <div className="flex items-center mb-2 w-full justify-between">
        <FileIcon type={file.fileType} />
        <span className="ml-2 truncate">{file.fileName}</span>
        <Popover>
          <PopoverTrigger>
            <EllipsisVertical
              size={18}
              className="ml-2 place-self-end cursor-pointer text-muted-foreground hover:text-foreground"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div
              onClick={() => setEditDialogOpen(true)}
              className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-background/50"
            >
              Edit
            </div>
            <div
              onClick={() => setDeleteDialogOpen(true)}
              className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-background/50"
            >
              Delete
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {file.fileType.includes("image") ? (
        <div className="h-32 w-full overflow-hidden rounded-md mb-2">
          <img src={file.fileUrl} alt={file.fileName} className="h-full w-full object-cover" />
        </div>
      ) : file.fileType.includes("text") ? (
        <div className="h-32 w-full overflow-hidden rounded-md mb-2">
          <iframe src={file.fileUrl} title={file.fileName} className="h-full w-full" />
        </div>
      ) : file.fileType.includes("pdf") ? (
        <div className="h-32 w-full overflow-hidden rounded-md mb-2 ">
          <iframe src={file.fileUrl} title={file.fileName} className="h-full w-full" />
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
        <a href={file.fileUrl} download={file.fileName} className="text-sm text-primary hover:underline">
          Download
        </a>
      </div>

      <DeleteDialogComponent onConfirm={handleDelete} title="Delete File" name={file.fileName} />

      <EditDialogComponent onConfirm={handleEdit} title="Edit File Name" initialValue={file.fileName} />
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
