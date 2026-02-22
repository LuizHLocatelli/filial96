import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string, images: string[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Check if the browser supports Speech Recognition
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition: any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'pt-BR'; // Assuming the app is mainly in Portuguese

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            
            if (currentTranscript) {
              setMessage(() => {
                return currentTranscript; 
              });
              
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
      setMessage(""); // Clear message when starting a new speech session for simplicity
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;
    onSend(message, images);
    setMessage("");
    setImages([]);
    
    // Reset textarea height
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

    // Convert images to Base64
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImages(prev => [...prev, base64]);
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

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="bg-background border-t p-4 flex flex-col gap-2 relative">
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border">
              <img src={img} alt={`Anexo ${i}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 items-end bg-muted/40 p-2 rounded-xl border border-input focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full shrink-0 mb-0.5" 
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </Button>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
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
          placeholder={isListening ? "Ouvindo..." : "Mensagem..."}
          className="min-h-[44px] max-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent py-3 px-1 text-base sm:text-sm"
          disabled={disabled || isListening}
          rows={1}
        />
        
        {recognitionRef.current && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleListening} 
            className={`rounded-full shrink-0 mb-0.5 ${isListening ? 'text-destructive bg-destructive/10 animate-pulse' : 'text-muted-foreground'}`}
            disabled={disabled}
            title={isListening ? "Parar gravação" : "Enviar mensagem de voz"}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
        
        <Button 
          onClick={handleSend} 
          disabled={disabled || (!message.trim() && images.length === 0)}
          size="icon"
          className="rounded-full shrink-0 mb-0.5"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-center">
        <span className="text-[10px] text-muted-foreground">O Gemini pode cometer erros. Verifique informações importantes.</span>
      </div>
    </div>
  );
}
