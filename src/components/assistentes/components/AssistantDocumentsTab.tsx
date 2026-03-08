import { useRef } from "react";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssistantDocuments } from "../hooks/useAssistantDocuments";

interface AssistantDocumentsTabProps {
  assistantId?: string;
}

export function AssistantDocumentsTab({ assistantId }: AssistantDocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents, isLoading, uploadDocument, deleteDocument } = useAssistantDocuments(assistantId);

  if (!assistantId) {
    return (
      <div className="text-center text-muted-foreground py-8 text-sm">
        Salve o assistente primeiro para adicionar documentos à base de conhecimento.
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      uploadDocument.mutate({ file, assistantId });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Base de Conhecimento</h4>
          <p className="text-xs text-muted-foreground">
            Documentos que o assistente usa como referência para respostas.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDocument.isPending}
        >
          {uploadDocument.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,text/plain,.txt,.md,.csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="border border-dashed rounded-lg py-8 text-center text-muted-foreground text-sm">
          Nenhum documento adicionado ainda.
          <br />
          <span className="text-xs">Formatos aceitos: PDF, TXT, MD, CSV</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
            >
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => deleteDocument.mutate(doc.file_url)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
