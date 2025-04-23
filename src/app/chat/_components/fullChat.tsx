import { type Message } from "ai";
import { ScrollArea } from "../../_components/ui/scroll-area";
import MemoizedMarkdown from "../../_components/memoizedMarkdown";
import { useEffect, useRef } from "react";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function FullChat({ messages, isLoading }: FullChatProps) {
  // TODO: Show Image and File Attachments
  // TODO: Show reasoning, sources, and errors
  // TODO: Edit last sent message and resend
  // TODO: Ability to scroll up while message is streaming

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const lastContentLengthRef = useRef<number>(0);

  useEffect(() => {
    // Check if number of messages has increased
    if (messages.length > prevMessagesLengthRef.current) {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      prevMessagesLengthRef.current = messages.length;

      lastContentLengthRef.current = messages[messages.length - 1]?.content.length ?? 0;
    }
    // Or if the last message's content length has increased substantially
    else if (messages.length > 0) {
      const currentContentLength = messages[messages.length - 1]?.content.length ?? 0;

      // Only scroll if content length increased by at least 300 characters
      if (currentContentLength > lastContentLengthRef.current + 300) {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        lastContentLengthRef.current = currentContentLength;
      }
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="w-full max-w-4xl pt-16 pb-40">
      <div className="w-full max-w-4xl space-y-4 my-4">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className={`flex justify-end`}>
                <div className="max-w-3xl rounded-2xl px-5 py-3 leading-relaxed bg-muted text-white whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            );
          } else if (message.role === "assistant") {
            return (
              <div key={message.id} className="max-w-4xl px-2 py-3 prose dark:prose-invert">
                <MemoizedMarkdown content={message.content} id={message.id} />
              </div>
            );
          }
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center space-x-1 pt-8 pb-48">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
        </div>
      )}
    </ScrollArea>
  );
}
