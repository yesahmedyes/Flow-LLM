import { useState, useRef } from "react";

export const UploadArea = ({ onDrop }: { onDrop: (files: File[]) => Promise<void> }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      void onDrop(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void onDrop(Array.from(e.target.files));
    }
  };

  return {
    getRootProps: () => ({
      onClick: handleClick,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    }),
    getInputProps: () => ({
      ref: inputRef,
      type: "file",
      style: { display: "none" },
      onChange: handleChange,
      multiple: true,
    }),
    isDragActive,
  };
};
