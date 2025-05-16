import { memo } from "react";

interface MessageSourcesProps {
  sources: { sourceType: string; id: string; url: string }[];
}

const MessageSources = memo(function MessageSources({ sources }: MessageSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row gap-4 overflow-x-auto pt-1 pb-3 mb-4">
      {sources.map((source) => (
        <div
          key={source.id}
          onClick={() => window.open(source.url, "_blank")}
          className="text-sm leading-relaxed bg-muted/60 rounded-md p-3 cursor-pointer"
        >
          {source.url}
        </div>
      ))}
    </div>
  );
});

export default MessageSources;
