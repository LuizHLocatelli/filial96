import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, X, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatDocument {
  base64: string;
  mimeType: string;
  fileName: string;
}

interface ChatInputProps {
  onSend: (message: string, images: string[], documents?: ChatDocument[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition: any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'pt-BR';

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            if (currentTranscript) {
              setMessage(() => currentTranscript);
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
              }
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMessage("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleSend = () => {
    if (!message.trim() && images.length === 0 && documents.length === 0) return;
    onSend(message, images, documents.length > 0 ? documents : undefined);
    setMessage("");
    setImages([]);
    setDocuments([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return;

        if (file.type.startsWith("image/")) {
          setImages(prev => [...prev, result]);
        } else {
          const base64 = result.split(",")[1] || result;
          setDocuments(prev => [...prev, {
            base64,
            mimeType: file.type || "application/octet-stream",
            fileName: file.name,
          }]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const hasContent = message.trim() || images.length > 0 || documents.length > 0;

  return (
    <div className="bg-gradient-to-t from-background via-background to-background/80 border-t p-3 sm:p-4 flex flex-col gap-2 relative">
      {/* Attachments preview */}
      <AnimatePresence>
        {(images.length > 0 || documents.length > 0) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {images.map((img, i) => (
              <motion.div 
                key={`img-${i}`} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-16 h-16 rounded-xl overflow-hidden border shadow-sm shrink-0 group"
              >
                <img src={img} alt={`Anexo ${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/40 sm:bg-black/0 sm:group-hover:bg-black/40 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}
            {documents.map((doc, i) => (
              <motion.div 
                key={`doc-${i}`} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl border bg-card shadow-sm shrink-0 max-w-[200px] group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs truncate font-medium">{doc.fileName}</span>
                <button
                  onClick={() => removeDocument(i)}
                  className="absolute top-1 right-1 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full p-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex gap-2 items-end bg-card p-2 rounded-2xl border border-border/60 shadow-sm focus-within:border-primary/40 focus-within:shadow-md focus-within:shadow-primary/5 transition-all duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl shrink-0 mb-0.5 h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </Button>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf,text/plain,.txt,.csv,.md"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled}
        />

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎙️ Ouvindo..." : "Escreva sua mensagem..."}
          className="min-h-[44px] max-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent py-3 px-1 text-base sm:text-sm placeholder:text-muted-foreground/50"
          disabled={disabled || isListening}
          rows={1}
        />

        {recognitionRef.current && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            className={`rounded-xl shrink-0 mb-0.5 h-9 w-9 transition-all ${
              isListening 
                ? 'text-destructive bg-destructive/10 animate-pulse shadow-sm shadow-destructive/20' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
            disabled={disabled}
            title={isListening ? "Parar gravação" : "Enviar mensagem de voz"}
          >
            <Mic className="w-[18px] h-[18px]" />
          </Button>
        )}

        <motion.div
          animate={{ scale: hasContent ? 1 : 0.9, opacity: hasContent ? 1 : 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            onClick={handleSend}
            disabled={disabled || !hasContent}
            size="icon"
            className="rounded-xl shrink-0 mb-0.5 h-9 w-9 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
      <div className="text-center hidden sm:block">
        <span className="text-[10px] text-muted-foreground/50">O Gemini pode cometer erros. Verifique informações importantes.</span>
      </div>
    </div>
  );
}
