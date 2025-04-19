import { type Message } from "ai";
import { ScrollArea } from "./ui/scroll-area";
import CustomMarkdown from "./customMarkdown";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function FullChat({ messages, isLoading }: FullChatProps) {
  return (
    <ScrollArea className="w-full h-10/12 max-w-4xl pt-4 pb-24">
      <div className="w-full max-w-4xl space-y-4 my-4 px-2">
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
              <div key={message.id} className="max-w-4xl px-5 py-3 prose dark:prose-invert">
                <CustomMarkdown content={message.content} />
              </div>
            );
          }
        })}
      </div>

      {!isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-10 h-10 rounded-full border-t-transparent border-b-transparent border-l-transparent border-r-transparent border-2 border-blue-500 animate-spin"></div>
        </div>
      )}
    </ScrollArea>
  );
}
