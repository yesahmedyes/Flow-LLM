/* eslint-disable @next/next/no-img-element */
import { EllipsisVertical } from "lucide-react";
import { Popover, PopoverTrigger } from "~/app/_components/ui/popover";
import { PopoverContent } from "~/app/_components/ui/popover";
import { type FileData } from "~/lib/types/db-types";
import { api } from "~/trpc/react";
import { useDeleteDialog } from "~/app/_components/deleteDialog";
import { useEditDialog } from "~/app/_components/editDialog";
import { toast } from "sonner";

export default function FileCard({ file }: { file: FileData }) {
  const { DeleteDialogComponent, setOpen: setDeleteDialogOpen } = useDeleteDialog();
  const { EditDialogComponent, setOpen: setEditDialogOpen } = useEditDialog();

  const utils = api.useUtils();

  const deleteFileMutation = api.files.deleteFile.useMutation({
    onMutate: async ({ fileUrl }) => {
      await utils.files.fetchFiles.cancel();

      const previousFiles = utils.files.fetchFiles.getInfiniteData({ limit: 10 });

      utils.files.fetchFiles.setInfiniteData({ limit: 10 }, (old) => {
        if (!old) return { pages: [], pageParams: [] };

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.fileUrl !== fileUrl),
          })),
        };
      });

      setDeleteDialogOpen(false);

      return { previousFiles };
    },
    onError: (err, variables, context) => {
      if (context?.previousFiles) {
        utils.files.fetchFiles.setInfiniteData({ limit: 10 }, () => context.previousFiles);
      }
      toast.error("Failed to delete file");
    },
    onSettled: () => {
      void utils.files.fetchFiles.invalidate();
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
  });

  const updateFileNameMutation = api.files.updateFileName.useMutation({
    onMutate: async ({ fileUrl, name }) => {
      await utils.files.fetchFiles.cancel();

      const previousFiles = utils.files.fetchFiles.getInfiniteData({ limit: 10 });

      utils.files.fetchFiles.setInfiniteData({ limit: 10 }, (old) => {
        if (!old) return { pages: [], pageParams: [] };

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.fileUrl === fileUrl ? { ...item, fileName: name } : item)),
          })),
        };
      });

      setEditDialogOpen(false);

      return { previousFiles };
    },
    onError: (err, variables, context) => {
      if (context?.previousFiles) {
        utils.files.fetchFiles.setInfiniteData({ limit: 10 }, () => context.previousFiles);
      }

      toast.error("Failed to update file name");
    },
    onSuccess: () => {
      toast.success("File name updated successfully");
    },
  });

  const handleDelete = async () => {
    deleteFileMutation.mutate({ fileUrl: file.fileUrl });
  };

  const handleEdit = async (newFileName: string) => {
    updateFileNameMutation.mutate({ fileUrl: file.fileUrl, name: newFileName });
  };

  return (
    <div key={file.id} className="border rounded-lg p-4 flex flex-col">
      <div className="flex items-center pb-2 w-full justify-between">
        <FileIcon type={file.fileType} />
        <span className="ml-2 truncate text-sm">{file.fileName}</span>
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
