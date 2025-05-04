
import { useState, useEffect } from "react";
import { useTaskAttachments } from "@/hooks/useTaskAttachments";
import { AttachmentItem } from "./AttachmentItem";
import { AttachmentUploader } from "./AttachmentUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TaskAttachmentsProps {
  taskId?: string;
  readOnly?: boolean;
}

export function TaskAttachments({ taskId, readOnly = false }: TaskAttachmentsProps) {
  const {
    attachments,
    isUploading,
    progress,
    loadAttachments,
    uploadAttachment,
    deleteAttachment
  } = useTaskAttachments(taskId);
  
  useEffect(() => {
    if (taskId) {
      loadAttachments(taskId);
    }
  }, [taskId]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Anexos</CardTitle>
      </CardHeader>
      <CardContent>
        {!readOnly && (
          <>
            <AttachmentUploader 
              onUpload={(file) => uploadAttachment(file, taskId)}
              isUploading={isUploading}
              progress={progress}
            />
            <Separator className="my-4" />
          </>
        )}
        
        {attachments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {readOnly ? "Nenhum anexo disponível" : "Nenhum anexo foi adicionado ainda"}
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <AttachmentItem 
                key={attachment.id}
                attachment={attachment}
                onDelete={readOnly ? undefined : () => deleteAttachment(attachment.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
