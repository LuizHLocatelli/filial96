
import { useEffect } from "react";
import { useTaskAttachments } from "@/hooks/useTaskAttachments";
import { AttachmentItem } from "./AttachmentItem";
import { PaperclipIcon } from "lucide-react";

interface TaskAttachmentsViewProps {
  taskId: string;
}

export function TaskAttachmentsView({ taskId }: TaskAttachmentsViewProps) {
  const {
    attachments,
    loadAttachments
  } = useTaskAttachments(taskId);
  
  useEffect(() => {
    if (taskId) {
      loadAttachments(taskId);
    }
  }, [taskId]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PaperclipIcon className="h-4 w-4" />
        <h4 className="font-semibold text-sm">Anexos ({attachments.length})</h4>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {attachments.map((attachment) => (
          <AttachmentItem 
            key={attachment.id}
            attachment={attachment}
          />
        ))}
      </div>
    </div>
  );
}
