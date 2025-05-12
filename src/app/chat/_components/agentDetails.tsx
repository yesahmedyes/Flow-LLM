import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/app/_components/ui/accordion";

interface AgentDetailsProps {
  annotations: { type: string; value: string }[];
}

export default function AgentDetails(props: AgentDetailsProps) {
  const { annotations } = props;

  return (
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
  );
}
