import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useChatAttachments } from "../hooks/useChatAttachments";

export interface ChatDocument {
  base64: string;
  mimeType: string;
  fileName: string;
}

interface ChatInputProps {
  onSend: (message: string, images: string[], documents?: ChatDocument[]) => void;
  disabled?: boolean;
  variant?: "default" | "floating";
}

export function ChatInput({ onSend, disabled, variant = "default" }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    images,
    documents,
    handleFileChange,
    removeImage,
    removeDocument,
    clearAttachments
  } = useChatAttachments();

  const handleSpeechResult = useCallback((text: string) => {
    setMessage(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, []);

  const { isListening, toggleListening, hasRecognitionSupport } = useSpeechRecognition(handleSpeechResult);

  const handleSend = () => {
    if (!message.trim() && images.length === 0 && documents.length === 0) return;
    onSend(message, images, documents.length > 0 ? documents : undefined);
    setMessage("");
    clearAttachments();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const hasContent = message.trim() || images.length > 0 || documents.length > 0;

  const isFloating = variant === "floating";

  return (
    <div className={`transition-all duration-500 relative z-10 w-full ${
      isFloating 
        ? "w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-0 sm:px-4" 
        : "bg-card/95 backdrop-blur-md border-t border-border/50 p-3 sm:p-4 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.4)]"
    } gap-2.5`}>
      {/* Attachments preview */}
      <AnimatePresence>
        {(images.length > 0 || documents.length > 0) && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 4 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className={`flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide w-full ${isFloating ? "px-4 sm:px-2" : ""}`}
          >
            {images.map((img, i) => (
              <motion.div 
                key={`img-${i}`} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/60 shadow-sm shrink-0 group ring-1 ring-black/5 dark:ring-white/5"
              >
                <img src={img} alt={`Anexo ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/40 sm:bg-black/0 sm:group-hover:bg-black/50 transition-colors flex items-center justify-center backdrop-blur-[1px] sm:backdrop-blur-none sm:group-hover:backdrop-blur-[1px]"
                >
                  <X className="w-4 h-4 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </button>
              </motion.div>
            ))}
            {documents.map((doc, i) => (
              <motion.div 
                key={`doc-${i}`} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm shrink-0 max-w-[180px] group ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-xs truncate font-medium text-foreground/90">{doc.fileName}</span>
                  <span className="text-[10px] text-muted-foreground truncate uppercase">{doc.fileName.split('.').pop()}</span>
                </div>
                <button
                  onClick={() => removeDocument(i)}
                  className="absolute top-1.5 right-1.5 bg-background/90 hover:bg-destructive text-muted-foreground hover:text-destructive-foreground rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-border/50 shadow-sm"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className={`flex gap-1.5 sm:gap-2 items-end bg-background/50 p-1 border border-border/50 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-background/80 transition-all duration-300 group w-full max-w-full ${
        isFloating ? "rounded-[2rem] shadow-lg hover:shadow-xl dark:shadow-none hover:border-primary/30 py-1.5 px-1.5 sm:py-2 sm:px-2" : "rounded-2xl"
      }`}>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 mb-0.5 h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${
            isFloating ? "rounded-full" : "rounded-xl"
          }`}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-4.5 h-4.5 sm:w-5 h-5" />
        </Button>
        <input
          type="file"
          multiple
          accept="audio/*,video/*,image/*,application/pdf,text/plain,.txt,.csv,.md"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileInputChange}
          disabled={disabled}
        />

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎙️ Ouvindo..." : isFloating ? "Como posso ajudar você hoje?" : "Escreva sua mensagem..."}
          className="min-h-[40px] sm:min-h-[44px] max-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent py-2 px-1 text-[13px] sm:text-sm placeholder:text-[12px] sm:placeholder:text-[13px] placeholder:text-muted-foreground/60 leading-relaxed font-normal"
          disabled={disabled || isListening}
          rows={1}
        />

        {hasRecognitionSupport && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            className={`shrink-0 mb-0.5 h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300 ${
              isFloating ? "rounded-full" : "rounded-xl"
            } ${
              isListening 
                ? 'text-destructive bg-destructive/15 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
            disabled={disabled}
            title={isListening ? "Parar gravação" : "Enviar mensagem de voz"}
          >
            <Mic className="w-4.5 h-4.5 sm:w-5 h-5" />
          </Button>
        )}

        <motion.div
          animate={{ 
            scale: hasContent ? 1 : 0.95, 
            opacity: hasContent ? 1 : 0.5 
          }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleSend}
            disabled={disabled || !hasContent}
            size="icon"
            className={`shrink-0 mb-0.5 h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300 ${
              isFloating ? "rounded-full" : "rounded-xl"
            } ${
              hasContent 
                ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
