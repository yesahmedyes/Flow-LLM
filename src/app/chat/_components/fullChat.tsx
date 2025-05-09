import { type Message } from "ai";
import { ScrollArea } from "../../_components/ui/scroll-area";
import MemoizedMarkdown from "../../_components/memoizedMarkdown";
import { useEffect, useRef } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/app/_components/ui/accordion";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function FullChat({ messages, isLoading }: FullChatProps) {
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
    <ScrollArea ref={scrollAreaRef} className="w-full max-w-4xl pt-20 pb-48">
      <div className="flex flex-col w-full max-w-4xl">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className={`flex justify-end`}>
                <div className="max-w-3xl rounded-2xl px-5 py-3 leading-relaxed bg-muted text-foreground font-light dark:font-normal whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
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
