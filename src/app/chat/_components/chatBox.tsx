import { DocumentText, Image, ArrowRight, Stop, Setting4 } from "iconsax-react";

import { Add } from "iconsax-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../_components/ui/popover";
import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import AgentSelection from "../../_components/agentSelection";
import { Minimize2, Maximize2 } from "lucide-react";
import React from "react";

interface ChatBoxProps {
  messagesPresent: boolean;
  onSubmit: (message: string) => void;
  stop: () => void;
  isLoading: boolean;
  setAgentSelected: (value: boolean) => void;
}

const ChatBox = React.memo((props: ChatBoxProps) => {
  const { messagesPresent, onSubmit, stop, isLoading, setAgentSelected } = props;

  const [message, setMessage] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [agent, setAgent] = useState(false);

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(message);

      setMessage("");

      if (isFullScreen) {
        setIsFullScreen(false);
      }
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
        className={`flex relative flex-col gap-1 justify-between rounded-2xl border bg-background border-foreground/10 py-2 ${
          messagesPresent && !isFullScreen && "mb-8"
        } ${isFullScreen ? "w-full h-full max-w-6xl max-h-[90vh]" : "w-4xl"}`}
      >
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
        <div className="flex items-center">
          <TextareaAutosize
            placeholder="Ask Flow"
            className={`placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive px-4 py-1.5 flex field-sizing-content w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none ${
              isFullScreen ? "max-h-[calc(90vh-70px)] w-full" : "w-full max-h-24"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSubmit}
            minRows={1}
          />
        </div>
        <div className="flex flex-row justify-between items-center pt-2 px-2 pb-1">
          <div className="flex flex-row gap-2.5 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer bg-popover rounded-full w-8 h-8 border flex items-center justify-center ml-1">
                  <Add size={18} className="stroke-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="rounded-2xl">
                <div className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-accent/80">
                  <Image size={20} className="stroke-foreground" />
                  Image
                </div>
                <div className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-accent/80">
                  <DocumentText size={20} className="stroke-foreground" />
                  File
                </div>
              </PopoverContent>
            </Popover>
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
