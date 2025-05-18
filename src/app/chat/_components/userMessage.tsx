import { type UIMessage } from "ai";
import { useRef, useState } from "react";
import { Pencil, ChevronDown, ChevronUp } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "~/app/_components/ui/button";
import React from "react";

interface UserMessageProps {
  message: UIMessage;
  onEditSave: (messageId: string, content: string) => void;
}

const UserMessage = React.memo((props: UserMessageProps) => {
  const { message, onEditSave } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const isLongMessage = message.content.length > 250;

  const getCollapsedContent = () => {
    if (!isCollapsed || !isLongMessage) return message.content;

    return message.content.slice(0, 250) + "...";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      onEditSave(message.id, editContent);
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2 py-4">
      {message.experimental_attachments && message.experimental_attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-auto mb-1">
          {message.experimental_attachments.map((attachment, index) => (
            <div
              key={index}
              onClick={() => window.open(attachment.url, "_blank")}
              className="h-24 w-24 overflow-hidden rounded-md cursor-pointer"
            >
              {attachment.contentType?.includes("image") ? (
                <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
              ) : (
                <iframe src={attachment.url} title={attachment.name} className="h-full w-full" />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end group">
        {isEditing ? (
          <div className="flex flex-col w-full">
            <TextareaAutosize
              className={`border rounded-lg px-4 py-3 placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content w-full bg-transparent text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none`}
              minRows={1}
              ref={textareaRef}
              value={editContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
            />

            <div className="flex flex-row justify-end gap-3 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
              >
                Cancel
              </Button>
              <Button variant="default" onClick={() => onEditSave(message.id, editContent)}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl rounded-2xl px-5 py-3 leading-relaxed bg-muted text-foreground font-light dark:font-normal whitespace-pre-wrap relative">
            {getCollapsedContent()}

            {isLongMessage && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mt-2 flex items-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={isCollapsed ? "Show more" : "Show less"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown size={14} className="mr-1" /> Show more
                  </>
                ) : (
                  <>
                    <ChevronUp size={14} className="mr-1" /> Show less
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Edit message"
            >
              <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

UserMessage.displayName = "UserMessage";

export default UserMessage;
