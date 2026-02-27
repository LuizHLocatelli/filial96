import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StandardDialogHeader } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, FileText } from "lucide-react";
import { ArquivoGerencial } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@/components/ui/pdf-viewer/index";
import DOMPurify from "dompurify";

interface FileViewerProps {
  arquivo: ArquivoGerencial | null;
  url: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export const FileViewer = ({ arquivo, url, open, onOpenChange }: FileViewerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [arquivo?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!arquivo || !url) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-document-analyzer', {
        body: {
          action: 'chat',
          fileId: arquivo.id,
          message: input,
          history: messages
        }
      });

      if (error) throw error;

      if (data && data.text) {
        setMessages(prev => [...prev, { role: "model", parts: [{ text: data.text }] }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "model", 
        parts: [{ text: "Desculpe, ocorreu um erro ao analisar sua pergunta. Tente novamente mais tarde." }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const html = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/```(.*?)```/gs, '<pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code className="bg-muted px-1 rounded">$1</code>')
      .replace(/\n/g, "<br/>");

    const safeHtml = DOMPurify.sanitize(html);

    return (
      <div
        dangerouslySetInnerHTML={{ __html: safeHtml }}
        className="text-sm prose dark:prose-invert prose-p:leading-relaxed max-w-none break-words"
      />
    );
  };

  const isImage = arquivo.tipo_arquivo.startsWith('image/');
  const isPdf = arquivo.tipo_arquivo === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col p-0 glass-dialog" hideCloseButton>
        <StandardDialogHeader 
          icon={Bot} 
          title={arquivo.nome_arquivo} 
          onClose={() => onOpenChange(false)} 
        />
        
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-background/50 relative">
          
          {/* Left Side: Document Viewer */}
          <div className="flex-1 md:w-2/3 border-b md:border-b-0 md:border-r border-border/50 bg-black/5 dark:bg-white/5 relative flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
            {isImage ? (
              <img 
                src={url} 
                alt={arquivo.nome_arquivo} 
                className="max-w-full max-h-full object-contain p-4"
              />
            ) : isPdf ? (
              <div className="w-full h-full overflow-hidden">
                <PDFViewer url={url} className="h-full w-full" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground p-8 text-center">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Visualização Indisponível</h3>
                <p className="mt-2 text-sm max-w-sm">
                  O visualizador nativo não suporta este formato de arquivo.
                  Faça o download para visualizar o conteúdo.
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => window.open(url, '_blank')}
                >
                  Fazer Download
                </Button>
              </div>
            )}
          </div>

          {/* Right Side: Gemini Chat */}
          <div className="w-full md:w-1/3 flex flex-col flex-shrink-0 bg-background/50 border-t md:border-t-0 border-border/50 min-h-[50vh] md:min-h-0">
            <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Analisar com IA</h3>
                <p className="text-[10px] text-muted-foreground">Pergunte sobre este documento</p>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 p-4 space-y-4 overflow-y-auto"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div className="max-w-[250px]">
                    <p className="text-sm font-medium">Faça perguntas sobre o documento</p>
                    <p className="text-xs text-muted-foreground mt-1">Ex: "Resuma os pontos principais", "Qual o valor total?"</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex space-x-2 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                      msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl text-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap" 
                        : "bg-muted rounded-tl-sm shadow-sm"
                    )}>
                      {renderMessageContent(msg.parts[0].text)}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex space-x-2 max-w-[85%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="p-3 rounded-xl text-sm bg-muted rounded-tl-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-xs font-medium">Analisando...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-background/80 sticky bottom-0 z-10 w-full mt-auto">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center space-x-2 relative"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte à IA..."
                  className="pr-10 rounded-full bg-background"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 w-8 h-8 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
