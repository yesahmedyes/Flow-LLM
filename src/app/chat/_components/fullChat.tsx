import { type UIMessage } from "ai";
import { Virtuoso } from "react-virtuoso";
import MemoizedMarkdown from "../../_components/memoizedMarkdown";
import UserMessage from "./userMessage";
import React from "react";
import AgentDetails from "./agentDetails";
import MessageSources from "./messageSources";

interface FullChatProps {
  messages: UIMessage[];
  onEditMessage: (messageId: string, content: string) => void;
}

const FullChat = React.memo(({ messages, onEditMessage }: FullChatProps) => {
  const messagesLength = messages.length - 1;

  return (
    <div className="w-full h-full">
      <Virtuoso
        className="w-full h-full"
        data={messages}
        itemContent={(index, message) => {
          return (
            <div
              className={`flex flex-col mx-auto max-w-4xl ${index == 0 && "pt-16"} ${index == messagesLength && "pb-48"}`}
            >
              {message.role === "user" ? (
                <UserMessage key={message.id} message={message} onEditSave={onEditMessage} />
              ) : message.role === "assistant" ? (
                <div key={message.id} className="flex flex-col px-2 py-4">
                  {message.annotations && message.annotations.length > 0 && (
                    <AgentDetails annotations={message.annotations as { type: string; value: string }[]} />
                  )}

                  <MessageSources
                    sources={message.parts.filter((part) => part.type === "source").map((part) => part.source)}
                  />

                  {message.parts && message.parts.length > 0 && (
                    <div className="prose dark:prose-invert max-w-none text-foreground/70 dark:text-foreground/85">
                      {message.parts?.map((part, index) => {
                        if (part.type === "reasoning") {
                          return (
                            <div className="text-sm text-foreground/80 dark:text-muted-foreground" key={index}>
                              {part.reasoning}
                            </div>
                          );
                        }
                        if (part.type === "text") {
                          return <MemoizedMarkdown content={part.text} id={message.id + index} key={index} />;
                        }
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        }}
        followOutput={true}
      />
    </div>
  );
});

FullChat.displayName = "FullChat";

export default FullChat;
