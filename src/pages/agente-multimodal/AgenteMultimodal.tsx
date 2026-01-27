import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Loader2,
  Image as ImageIcon,
  X,
  Video,
  Download,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface AgentConfig {
  id: string;
  name: string;
  bias: string;
  objective: string;
  is_active: boolean;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  timestamp: string;
}

interface AgenteMultimodalProps {
  initialConfig: AgentConfig;
  onBack: () => void;
}

export default function AgenteMultimodal({ initialConfig, onBack }: AgenteMultimodalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConfig] = useState<AgentConfig>(initialConfig);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage || !selectedConfig || loading) return;

    setLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toISOString(),
    };

    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setInput("");
    setSelectedImage(null);

    try {
      const response = await supabase.functions.invoke("gemini-agent", {
        body: {
          message: userMessage.content,
          imageData: userMessage.imageUrl,
          configId: selectedConfig.id,
          userId: user?.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro na comunicação");
      }

      const { response: botResponse, video } = response.data;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponse || "Desculpe, não consegui processar sua mensagem.",
        videoUrl: video?.url,
        videoDuration: video?.duration,
        timestamp: new Date().toISOString(),
      };

      setMessages([...messagesWithUser, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro. Tente novamente.",
        timestamp: new Date().toISOString(),
      };

      setMessages([...messagesWithUser, errorMessage]);

      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = useCallback(
    async (url: string, messageId: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `video-${messageId}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        toast({
          title: "Download iniciado",
          description: "O vídeo está sendo baixado",
        });
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o vídeo",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] flex flex-col bg-animated-gradient overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full md:px-4 md:py-2 h-full">
        <Card className="flex-1 flex flex-col h-full overflow-hidden border-none md:border md:glass-card shadow-2xl rounded-none md:rounded-2xl">
          <CardHeader className="border-b bg-background/80 backdrop-blur-md p-3 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 h-11 w-11 md:h-9 md:w-9 glass-button-ghost"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-purple-500/30">
                <AvatarFallback className="bg-purple-500/10">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate">
                  {selectedConfig.name}
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Gemini + Veo 3.1 Fast
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 relative bg-muted/30 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="bg-purple-500/5 p-6 rounded-full mb-4">
                      <Sparkles className="h-12 w-12 text-purple-500/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground/80">
                      Olá! Eu sou o {selectedConfig.name}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mt-2">
                      Posso responder suas perguntas, analisar imagens e gerar
                      vídeos. Como posso ajudar?
                    </p>
                    {selectedConfig.bias && (
                      <p className="text-xs text-muted-foreground mt-4 max-w-sm">
                        <span className="font-medium">Viés:</span>{" "}
                        {selectedConfig.bias}
                      </p>
                    )}
                  </motion.div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1 border border-purple-500/10">
                        <AvatarFallback className="bg-purple-500/10 text-[10px]">
                          <Bot className="h-4 w-4 text-purple-500" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-background border border-purple-500/10 rounded-tl-none"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="text-sm md:text-base prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-2">{children}</ol>
                              ),
                              code: ({ children }) => (
                                <code className="bg-purple-500/10 px-1.5 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed">
                          {message.content}
                        </p>
                      )}

                      {message.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-primary/20">
                          <img
                            src={message.imageUrl}
                            alt="Imagem enviada"
                            className="max-w-full h-auto max-h-60 object-contain"
                          />
                        </div>
                      )}

                      {message.videoUrl && (
                        <div className="mt-3 space-y-2">
                          <div className="rounded-lg overflow-hidden border border-purple-500/20">
                            <video
                              src={message.videoUrl}
                              controls
                              className="max-w-full h-auto"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadVideo(message.videoUrl!, message.id)
                            }
                            className="gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Baixar Vídeo ({message.videoDuration}s)
                          </Button>
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                          message.role === "user"
                            ? "text-primary-foreground/70 justify-end"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1 border border-primary/20">
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        <span className="text-sm text-purple-600">
                          Processando...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            <div className="p-3 md:p-6 bg-background/80 backdrop-blur-md border-t shrink-0">
              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 flex items-center gap-2 bg-purple-500/5 p-2 rounded-lg max-w-xs mx-auto"
                  >
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Prévia"
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      Imagem anexada
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 max-w-4xl mx-auto items-center glass-input p-1.5 rounded-xl shadow-lg border-purple-500/10">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                  id="multimodal-image-input"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className={`h-11 w-11 rounded-lg shrink-0 transition-all duration-200 ${
                    selectedImage
                      ? "text-purple-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem ou peça um vídeo..."
                  disabled={loading}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm h-11 min-h-[44px]"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !selectedImage) || loading}
                  size="icon"
                  className={`h-11 w-11 rounded-lg transition-all duration-200 shrink-0 ${
                    input.trim() || selectedImage
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      : "opacity-50"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Dica: Peça "gere um vídeo de..." para criar vídeos de até 8 segundos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
