import { type Message } from "ai";
import { ScrollArea } from "../../_components/ui/scroll-area";
import MemoizedMarkdown from "../../_components/memoizedMarkdown";
import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/app/_components/ui/accordion";
import UserMessage from "./userMessage";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, content: string) => void;
}

export default function FullChat({ messages, isLoading, onEditMessage }: FullChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const lastContentLengthRef = useRef<number>(0);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    // Check if number of messages has increased
    if (messages.length !== prevMessagesLengthRef.current) {
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

  const handleEditStart = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);

    if (message) {
      setEditingMessageId(messageId);
      setEditContent(message.content);
    }
  };

  const handleEditChange = (content: string) => {
    setEditContent(content);
  };

  const handleEditSave = () => {
    if (editingMessageId) {
      onEditMessage(editingMessageId, editContent);
    }

    setEditingMessageId(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="w-full max-w-4xl pt-20 pb-48">
      <div className="flex flex-col w-full max-w-4xl">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <UserMessage
                key={message.id}
                message={message}
                isEditing={message.id === editingMessageId}
                editContent={editContent}
                onEditStart={handleEditStart}
                onEditChange={handleEditChange}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
              />
            );
          } else if (message.role === "assistant") {
            return (
              <div key={message.id} className="flex flex-col max-w-4xl px-2 py-8">
                {message.annotations && message.annotations.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="annotations">
                      <AccordionTrigger>Show agent details</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-3">
                          {message.annotations.map((annotation, index) => {
                            const annotationObject = annotation as { type: string; value: string };

                            return (
                              <div
                                className="text-sm text-foreground/80 dark:text-muted-foreground font-light"
                                key={index}
                              >
                                {annotationObject.value}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

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
