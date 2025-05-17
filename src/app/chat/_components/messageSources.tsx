import { Document } from "iconsax-react";
import { memo } from "react";

interface MessageSourcesProps {
  sources: { sourceType: string; id: string; url: string }[];
  addSpace: boolean;
}

const MessageSources = memo(function MessageSources({ sources, addSpace }: MessageSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-row gap-4 overflow-x-auto ${addSpace && "pt-2"} pb-2 no-scrollbar`}>
      {sources.map((source) => (
        <div
          key={source.id}
          onClick={() => window.open(source.url, "_blank")}
          className="group text-sm leading-relaxed bg-muted/60 rounded-md p-3 cursor-pointer max-w-96"
        >
          <span className="text-foreground/80 group-hover:text-foreground transition-colors duration-200 text-ellipsis overflow-hidden block">
            {source.url}
          </span>
        </div>
      ))}
    </div>
  );
});

export default MessageSources;
