/* eslint-disable @next/next/no-img-element */
import { DocumentText, Image as ImageIcon, ArrowRight, Stop, Setting4, Add, CloseCircle } from "iconsax-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../_components/ui/popover";
import TextareaAutosize from "react-textarea-autosize";
import { useMemo, useState } from "react";
import AgentSelection from "../../_components/agentSelection";
import { Minimize2, Maximize2, X } from "lucide-react";
import React from "react";
import { useModelsStore } from "~/app/stores/modelsStore";
import { toast } from "sonner";
import { useFileUpload, type UploadedFile } from "../../../hooks/useFileUpload";
import { useUploadArea } from "../../../hooks/useUploadArea";

interface ChatBoxProps {
  messagesPresent: boolean;
  onSubmit: (message: string, uploadedFiles?: Array<UploadedFile>) => void;
  stop: () => void;
  isLoading: boolean;
  setAgentSelected: (value: boolean) => void;
}

const ChatBox = React.memo((props: ChatBoxProps) => {
  const { messagesPresent, onSubmit, stop, isLoading, setAgentSelected } = props;

  const [message, setMessage] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [agent, setAgent] = useState(false);

  const {
    uploadingFiles,
    handleFileSelect,
    cancelUpload,
    removeUploadedFile,
    clearUploadedFiles,
    getUploadedFiles,
    hasUploadingFiles,
    uploadFile,
  } = useFileUpload();

  const handleSubmit = () => {
    if (message.length === 0 && uploadingFiles.length === 0) return;

    if (hasUploadingFiles()) {
      toast.error("Please wait for all files to finish uploading or cancel them first");

      return;
    }

    onSubmit(message, getUploadedFiles());
    setMessage("");

    clearUploadedFiles();

    if (isFullScreen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const [openAgentDialog, setOpenAgentDialog] = useState(false);

  const onAgentSelected = (agentSelected: boolean) => {
    setAgent(agentSelected);
    setAgentSelected(agentSelected);
  };

  const { preferredModels, selectedModel } = useModelsStore();

  const model = useMemo(
    () => preferredModels.find((model) => model.id === selectedModel),
    [preferredModels, selectedModel],
  );

  const imageInput = useMemo(() => model?.architecture.input_modalities.includes("image") ?? false, [model]);
  const fileInput = useMemo(() => model?.architecture.input_modalities.includes("file") ?? false, [model]);

  const handleFileDrop = async (files: File[]) => {
    if (!(imageInput || fileInput)) return;

    for (const file of files) {
      if (file.type.includes("image")) {
        if (imageInput) await uploadFile(file);
      } else {
        if (fileInput) await uploadFile(file);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useUploadArea({ onDrop: handleFileDrop, onClick: false });

  return (
    <div
      className={`fixed flex flex-col items-center w-full bg-background ${
        isFullScreen
          ? "inset-0 z-20 flex items-center justify-center"
          : messagesPresent
            ? "bottom-0"
            : "top-1/2 -translate-y-1/2 -mt-12"
      }`}
    >
      {!messagesPresent && !isFullScreen && (
        <div className="mb-8 text-2xl font-semibold text-white">What can I help you with?</div>
      )}

      <div
        {...getRootProps()}
        className={`
          flex relative flex-col gap-1 justify-between 
          rounded-2xl border bg-background py-2
          ${messagesPresent && !isFullScreen && "mb-8"}
          ${isFullScreen ? "w-full h-full max-w-6xl max-h-[90vh]" : "w-4xl"}
          ${isDragActive ? "border-blue-500 border-dashed" : "border-foreground/10"}
        `}
      >
        {<input {...getInputProps()} />}

        <div
          onClick={toggleFullScreen}
          className={`absolute cursor-pointer top-0 right-0 ${isFullScreen ? "px-4 py-4" : "px-3.5 py-3.5"}`}
        >
          {isFullScreen ? (
            <Minimize2 size={16} className="text-muted-foreground" />
          ) : (
            <Maximize2 size={12} className="text-muted-foreground" />
          )}
        </div>

        {uploadingFiles.length > 0 && (
          <div className="px-3 pt-1 pb-0.5 flex flex-wrap gap-2.5">
            {uploadingFiles
              .filter((file) => file.status !== "error")
              .map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between text-xs w-[50px] h-[50px] border rounded-md relative"
                >
                  {file.status === "uploading" && (
                    <>
                      <div className="text-muted-foreground text-center w-full">{file.progress}%</div>

                      <X
                        size={16}
                        className="absolute top-0 right-0 -mr-1 -mt-1 cursor-pointer stroke-foreground border border-foreground/50 p-0.5 bg-background rounded-full"
                        onClick={() => cancelUpload(file.id)}
                      />
                    </>
                  )}
                  {file.status === "completed" && (
                    <>
                      {file.url && (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                          {file.file.type.includes("image") ? (
                            <img src={file.url} alt={file.file.name} className="h-full w-full object-cover" />
                          ) : (
                            <iframe src={file.url} title={file.file.name} className="h-full w-full" />
                          )}
                        </div>
                      )}

                      <X
                        size={16}
                        className="absolute top-0 right-0 -mr-1 -mt-1 cursor-pointer stroke-foreground border border-foreground/50 p-0.5 bg-background rounded-full"
                        onClick={() => removeUploadedFile(file.id)}
                      />
                    </>
                  )}
                </div>
              ))}
          </div>
        )}

        <div className="flex items-center">
          <TextareaAutosize
            placeholder="Ask Flow"
            className={`placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive px-4 py-1.5 flex field-sizing-content w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none ${
              isFullScreen ? "max-h-[calc(90vh-70px)] w-full" : "w-full max-h-24"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                handleSubmit();
              }
            }}
            minRows={1}
          />
        </div>
        <div className="flex flex-row justify-between items-center pt-2 px-2 pb-1">
          <div className="flex flex-row gap-2.5 items-center">
            {(imageInput || fileInput) && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer bg-popover rounded-full w-8 h-8 border flex items-center justify-center ml-1">
                    <Add size={18} className="stroke-muted-foreground" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="rounded-2xl">
                  {imageInput && (
                    <div
                      className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-accent/80"
                      onClick={() => handleFileSelect("image")}
                    >
                      <ImageIcon size={20} className="stroke-foreground" />
                      Image
                    </div>
                  )}
                  {fileInput && (
                    <div
                      className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-accent/80"
                      onClick={() => handleFileSelect("file")}
                    >
                      <DocumentText size={20} className="stroke-foreground" />
                      File
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <div
              onClick={() => onAgentSelected(!agent)}
              className={`text-xs flex flex-row gap-3 items-center font-normal px-5 bg-popover cursor-pointer py-2 rounded-full border ${agent ? "border-blue-500/80 dark:border-blue-500/50 text-blue-500 " : "border-foreground/10 text-muted-foreground"}`}
            >
              Agent
              {agent && (
                <>
                  <Setting4
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAgentDialog(true);
                    }}
                    size={14}
                    className="stroke-muted-foreground cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
          {isLoading ? (
            <div
              className="flex flex-row group gap-2 items-center cursor-pointer bg-popover hover:bg-destructive/80 hover:border-destructive/80 rounded-full w-8 h-8 border justify-center mr-1"
              onClick={stop}
            >
              <Stop size={16} className="stroke-muted-foreground group-hover:stroke-white" />
            </div>
          ) : (
            <ArrowRight
              size={20}
              className={`mr-1 cursor-pointer hover:stroke-foreground ${message.length > 0 ? "stroke-muted-foreground" : "stroke-white/50"}`}
              onClick={handleSubmit}
            />
          )}
        </div>
      </div>

      <AgentSelection open={openAgentDialog} setOpen={setOpenAgentDialog} />
    </div>
  );
});

ChatBox.displayName = "ChatBox";

export default ChatBox;
