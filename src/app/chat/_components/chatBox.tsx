import { DocumentText, Image, ArrowRight, Stop } from "iconsax-react";

import { Add } from "iconsax-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../_components/ui/popover";
import { Textarea } from "../../_components/ui/textarea";
import { useState } from "react";

interface ChatBoxProps {
  messagesPresent: boolean;
  onSubmit: (message: string) => void;
  stop: () => void;
  isLoading: boolean;
}

export default function ChatBox({ messagesPresent, onSubmit, stop, isLoading }: ChatBoxProps) {
  // TODO: Option to extend chat box to full height
  // TODO: Make the stop button softer (transition on hover)

  const [agentSelected, setAgentSelected] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(message);

      setMessage("");
    }
  };

  return (
    <div
      className={`fixed flex flex-col items-center w-full bg-background ${messagesPresent ? "bottom-0" : "bottom-1/2 -mb-10"}`}
    >
      {!messagesPresent && <div className="mb-12 text-2xl font-semibold text-white">What can I help you with?</div>}

      <div
        className={`rounded-2xl w-4xl border bg-background border-neutral-700 px-2 py-2 ${messagesPresent && "mb-8"}`}
      >
        <div className="flex items-center">
          <Textarea
            placeholder="Ask Flow"
            className="border-none focus-visible:ring-0"
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
                <div className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-background/50">
                  <Image size={20} className="stroke-foreground" />
                  Image
                </div>
                <div className="flex flex-row gap-3 items-center cursor-pointer rounded-lg p-3 hover:bg-background/50">
                  <DocumentText size={20} className="stroke-foreground" />
                  File
                </div>
              </PopoverContent>
            </Popover>
            <div
              onClick={() => (agentSelected === null ? setAgentSelected("agent1") : setAgentSelected(null))}
              className={`text-xs font-normal px-5 bg-popover cursor-pointer py-2 rounded-full border ${agentSelected === null ? "border-neutral-800 text-muted-foreground" : "border-blue-500/50 text-blue-500 "}`}
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
    </div>
  );
}
