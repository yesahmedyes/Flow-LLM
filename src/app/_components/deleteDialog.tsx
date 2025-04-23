import { Warning2 } from "iconsax-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useCallback } from "react";

interface DeleteDialogProps {
  // Controlled mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Callback when delete is confirmed
  onConfirm: () => void | Promise<void>;

  // Customization
  title?: string;
  name?: string;
  cancelText?: string;
  deleteText?: string;

  // Optional loading state
  isLoading?: boolean;
}

export function DeleteDialog(props: DeleteDialogProps) {
  const {
    open,
    onOpenChange,
    onConfirm,
    title = "Delete",
    name = "this item",
    cancelText = "Cancel",
    deleteText = "Delete",
    isLoading,
  } = props;

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const handleConfirm = async () => {
    await onConfirm();
    if (!isControlled) {
      setInternalOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pb-3">
          <div className="flex flex-row justify-center items-center gap-2">
            <Warning2 className="stroke-foreground" size={24} />
            <div className="text-lg font-normal text-textPrimary">{title}</div>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <div className="text-sm text-center font-light leading-relaxed text-textTertiary">
              Are you sure you want to delete {name}?
            </div>
            <div className="text-sm text-center font-light leading-relaxed text-textTertiary">
              This action cannot be undone.
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 place-items-center sm:justify-center">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {deleteText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useDeleteDialog() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    DeleteDialogComponent: ({ onConfirm, ...props }: Omit<DeleteDialogProps, "open" | "onOpenChange">) => (
      <DeleteDialog open={open} onOpenChange={setOpen} onConfirm={onConfirm} {...props} />
    ),
  };
}
