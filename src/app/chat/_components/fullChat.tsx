import { type UIMessage } from "ai";
import { Virtuoso } from "react-virtuoso";
import MemoizedMarkdown from "../../_components/memoizedMarkdown";
import UserMessage from "./userMessage";
import React from "react";
import AgentDetails from "./agentDetails";

interface FullChatProps {
  messages: UIMessage[];
  onEditMessage: (messageId: string, content: string) => void;
  isLoading: boolean;
}

const FullChat = React.memo(({ messages, onEditMessage, isLoading }: FullChatProps) => {
  const messagesLength = messages.length - 1;

  return (
    <div className="w-full h-full">
      <Virtuoso
        className="w-full h-full"
        data={messages}
        itemContent={(index, message) => {
          return (
            <div
              className={`flex flex-col mx-auto max-w-4xl ${index == 0 && "pt-16"} ${index == messagesLength && !isLoading && "pb-48"}`}
            >
              {message.role === "user" && <UserMessage key={message.id} message={message} onEditSave={onEditMessage} />}

              {message.role === "assistant" && (
                <div key={message.id} className="flex flex-col px-2 py-3">
                  <AgentDetails message={message} />

                  {message.parts && message.parts.length > 0 && (
                    <div className="prose dark:prose-invert max-w-none text-foreground/70 dark:text-foreground/85">
                      {message.parts?.map((part, index) => {
                        if (part.type === "text") {
                          return <MemoizedMarkdown content={part.text} id={message.id + index} key={index} />;
                        }
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
        followOutput={true}
        components={{
          Footer: () =>
            isLoading ? (
              <div className="flex justify-center items-center space-x-1 pt-20 pb-48">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
              </div>
            ) : null,
        }}
      />
    </div>
  );
});

FullChat.displayName = "FullChat";

export default FullChat;
