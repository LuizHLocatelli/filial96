
import { useState } from "react";
import { 
  FileIcon, 
  FileImageIcon, 
  FilePdfIcon,
  Trash2,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete?: () => Promise<boolean>;
}

export function AttachmentItem({ attachment, onDelete }: AttachmentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isImage = attachment.type.startsWith("image/");
  const isPdf = attachment.type === "application/pdf";

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const getIcon = () => {
    if (isImage) return <FileImageIcon className="h-5 w-5 text-blue-500" />;
    if (isPdf) return <FilePdfIcon className="h-5 w-5 text-red-500" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return "Data desconhecida";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50">
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => isImage ? setShowPreview(true) : window.open(attachment.url, "_blank")}
        >
          {getIcon()}
          <div className="flex flex-col">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(attachment.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(attachment.url, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview dialog for images */}
      {isImage && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="pr-10">{attachment.name}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
