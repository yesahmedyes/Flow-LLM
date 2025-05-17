import { memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/app/_components/ui/accordion";

interface MessageReasoningProps {
  reasoning: string | undefined;
}

const MessageReasoning = memo(function MessageReasoning({ reasoning }: MessageReasoningProps) {
  if (!reasoning) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="reasoning">
        <AccordionTrigger>Show reasoning</AccordionTrigger>
        <AccordionContent>
          <div className="text-sm text-foreground/80 dark:text-muted-foreground font-light">{reasoning}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

export default MessageReasoning;
