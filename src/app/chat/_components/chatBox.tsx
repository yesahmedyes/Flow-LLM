/* eslint-disable jsx-a11y/alt-text */
import { DocumentText, Image, ArrowRight, Stop } from "iconsax-react";

import { Add } from "iconsax-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../_components/ui/popover";
import { Textarea } from "../../_components/ui/textarea";
import { useState } from "react";
import AgentSelection from "../../_components/agentSelection";
import { Minimize2, Maximize2 } from "lucide-react";

interface ChatBoxProps {
  messagesPresent: boolean;
  onSubmit: (message: string) => void;
  stop: () => void;
  isLoading: boolean;
  agentSelected: boolean;
  setAgentSelected: (agentSelected: boolean) => void;
}

export default function ChatBox(props: ChatBoxProps) {
  const { messagesPresent, onSubmit, stop, isLoading, agentSelected, setAgentSelected } = props;

  const [message, setMessage] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    setAgentSelected(agentSelected);

    if (agentSelected) {
      setOpenAgentDialog(true);
    }
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
        className={`flex relative flex-col justify-between rounded-2xl border bg-background border-foreground/10 px-2 py-2 ${
          messagesPresent && !isFullScreen && "mb-8"
        } ${isFullScreen ? "w-full h-full max-w-6xl max-h-[90vh]" : "w-4xl"}`}
      >
        <div className="absolute top-0 right-0.5 px-4 py-3.5 cursor-pointer">
          {isFullScreen ? (
            <Minimize2 onClick={toggleFullScreen} size={16} className="text-muted-foreground" />
          ) : (
            <Maximize2 onClick={toggleFullScreen} size={12} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center">
          <Textarea
            placeholder="Ask Flow"
            className={`border-none focus-visible:ring-0 pr-6 ${
              isFullScreen && "max-h-[calc(90vh-70px)] w-full flex-1 overflow-y-auto resize-none"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSubmit}
          />
        </div>
        <div className="flex flex-row justify-between items-center pt-2 p-1">
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
              onClick={() => onAgentSelected(!agentSelected)}
              className={`text-xs font-normal px-5 bg-popover cursor-pointer py-2 rounded-full border ${agentSelected ? "border-blue-500/80 dark:border-blue-500/50 text-blue-500 " : "border-foreground/10 text-muted-foreground"}`}
            >
              Agent
            </div>
          </div>
          {isLoading ? (
            <div
              className="flex flex-row gap-2 items-center cursor-pointer bg-popover hover:bg-popover/50 rounded-full w-8 h-8 border justify-center mr-1"
              onClick={stop}
            >
              <Stop size={16} className="stroke-muted-foreground" />
            </div>
          ) : (
            <ArrowRight size={20} className="stroke-white/50 mr-1" />
          )}
        </div>
      </div>

      <AgentSelection open={openAgentDialog} setOpen={setOpenAgentDialog} />
    </div>
  );
}
