import { type Message } from "ai";
import { ScrollArea } from "./ui/scroll-area";
import CustomMarkdown from "./customMarkdown";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function FullChat({ messages, isLoading }: FullChatProps) {
  return (
    <ScrollArea className="w-full max-w-4xl pt-4 pb-40">
      <div className="w-full max-w-4xl space-y-4 my-4">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className={`flex justify-end`}>
                <div className="max-w-3xl rounded-2xl px-5 py-3 leading-relaxed bg-muted text-white">
                  {message.content}
                </div>
              </div>
            );
          } else if (message.role === "assistant") {
            return (
              <div key={message.id} className="max-w-4xl px-2 py-3 prose dark:prose-invert">
                <CustomMarkdown content={message.content} />
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
