import type { UIMessage } from "ai";
import { memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/app/_components/ui/accordion";
import MessageReasoning from "./messageReasoning";
import MessageSources from "./messageSources";

interface AgentDetailsProps {
  message: UIMessage;
}

const AgentDetails = memo(function AgentDetails(props: AgentDetailsProps) {
  const { message } = props;

  const annotations = message.annotations as { type: string; value: string }[];
  const reasoning = message.parts?.filter((part) => part.type === "reasoning").map((part) => part.reasoning);
  const sources = message.parts?.filter((part) => part.type === "source").map((part) => part.source);

  const addSpace = (annotations && annotations.length > 0) || (reasoning && reasoning.length > 0);

  if (!(addSpace || (sources && sources.length > 0))) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3.5 pb-5">
      {annotations && annotations.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="annotations">
            <AccordionTrigger>Show agent details</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {annotations.map((annotation, index) => {
                  return (
                    <div className="text-sm text-foreground/80 dark:text-muted-foreground font-light" key={index}>
                      {annotation.value}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {reasoning && reasoning.length > 0 && <MessageReasoning reasoning={reasoning.join("\n")} />}

      {sources && sources.length > 0 && <MessageSources addSpace={addSpace} sources={sources} />}
    </div>
  );
});

export default AgentDetails;
