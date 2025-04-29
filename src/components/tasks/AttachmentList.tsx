
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Attachment } from "@/types";
import { FileText, Image as ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AttachmentListProps {
  attachments: Attachment[];
  onAttachmentDeleted: (attachmentId: string) => void;
}

export function AttachmentList({ attachments, onAttachmentDeleted }: AttachmentListProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handlePreview = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setIsOpen(true);
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Extrair o caminho do arquivo da URL
      const url = new URL(attachment.url);
      const filePath = url.pathname.split("/").slice(2).join("/");

      // Excluir o arquivo do storage
      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([filePath]);

      if (storageError) {
        console.error("Erro ao excluir arquivo do storage:", storageError);
      }

      // Excluir registro do banco de dados
      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Anexo excluído",
        description: `${attachment.name} foi removido com sucesso.`,
      });

      onAttachmentDeleted(attachment.id);
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anexo",
        description: "Não foi possível remover o anexo.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center border rounded-md p-2 bg-slate-50">
          {attachment.type === "image" ? (
            <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
          ) : (
            <FileText className="h-5 w-5 text-red-500 mr-2" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(attachment.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handlePreview(attachment)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(attachment)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      {/* Dialog para visualizar anexo */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedAttachment?.type === "image" ? (
              <img
                src={selectedAttachment.url}
                alt={selectedAttachment.name}
                className="mx-auto max-h-[70vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <FileText className="h-20 w-20 text-red-500 mb-4" />
                <p className="mb-4">Visualização de PDF não disponível</p>
                <Button asChild>
                  <a href={selectedAttachment?.url} target="_blank" rel="noopener noreferrer">
                    Abrir PDF
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
