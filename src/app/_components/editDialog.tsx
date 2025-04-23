import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useState, useCallback } from "react";

interface EditDialogProps {
  // Controlled mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Callback when edit is confirmed
  onConfirm: (value: string) => void | Promise<void>;

  // Initial value and validation
  initialValue: string;

  // Customization
  title?: string;
  placeholder?: string;
  cancelText?: string;
  saveText?: string;

  // Optional loading state
  isLoading?: boolean;
}

export function EditDialog(props: EditDialogProps) {
  const {
    open,
    onOpenChange,
    onConfirm,
    initialValue,
    title = "Edit",
    placeholder = "Enter value",
    cancelText = "Cancel",
    saveText = "Save",
    isLoading,
  } = props;

  const [value, setValue] = useState(initialValue);

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
    if (value.trim() && value !== initialValue) {
      await onConfirm(value);

      if (!isControlled) {
        setInternalOpen(false);
      }
    }
  };

  // Reset value when dialog opens
  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setValue(initialValue);
      }

      handleOpenChange(open);
    },
    [initialValue, handleOpenChange],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={value}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleConfirm();
              }
            }}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={!value.trim() || value === initialValue || isLoading}>
            {saveText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useEditDialog() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    EditDialogComponent: ({ onConfirm, ...props }: Omit<EditDialogProps, "open" | "onOpenChange">) => (
      <EditDialog open={open} onOpenChange={setOpen} onConfirm={onConfirm} {...props} />
    ),
  };
}
