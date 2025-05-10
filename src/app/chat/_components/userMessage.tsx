import { type Message } from "ai";
import { useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";

interface UserMessageProps {
  message: Message;
  isEditing: boolean;
  editContent: string;
  onEditStart: (messageId: string) => void;
  onEditChange: (content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

export default function UserMessage(props: UserMessageProps) {
  const { message, isEditing, editContent, onEditStart, onEditChange, onEditSave, onEditCancel } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEditSave();
    }
    if (e.key === "Escape") {
      onEditCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEditChange(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex justify-end">
      {isEditing ? (
        <div className="flex flex-col w-full">
          <Textarea
            className="px-3 py-3 min-h-12 max-h-96"
            ref={textareaRef}
            value={editContent}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />

          <div className="flex flex-row justify-end gap-3 mt-3">
            <Button variant="outline" onClick={onEditCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={onEditSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl rounded-2xl px-5 py-3 leading-relaxed bg-muted text-foreground font-light dark:font-normal whitespace-pre-wrap relative group">
          {message.content}

          <button
            onClick={() => onEditStart(message.id)}
            className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit message"
          >
            <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
