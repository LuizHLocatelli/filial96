import { motion } from 'framer-motion';
import { Bot, User, Check, CheckCheck, Play, Pause, Volume2, Sparkles, Clock, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, forwardRef } from 'react';
import type { MessageBubbleProps } from '../types';

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, isLast }, ref) => {
    const isUser = message.type === 'user';
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatus = () => {
    if (!isUser || !isLast) return null;

    const status = message.status || 'sent';

    return (
      <span className="ml-1 inline-flex items-center">
        {status === 'sent' && <Check className="h-3 w-3 text-primary-foreground/60" />}
        {status === 'delivered' && <CheckCheck className="h-3 w-3 text-primary-foreground/60" />}
        {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
      </span>
    );
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderLegendas = () => {
    if (!message.legendas) return null;

    const { urgencia, beneficio, desejo } = message.legendas;

    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Opções de Legendas</span>
        </div>

        {urgencia && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Urgência</span>
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{urgencia}</p>
          </div>
        )}

        {beneficio && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Benefício Financeiro</span>
            </div>
            <p className="text-sm text-green-900 dark:text-green-200 leading-relaxed">{beneficio}</p>
          </div>
        )}

        {desejo && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Desejo</span>
            </div>
            <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">{desejo}</p>
          </div>
        )}
      </div>
    );
  };

  const [videoError, setVideoError] = useState<string | null>(null);

  const renderVideoPlayer = () => {
    // Cenário: Erro na geração do vídeo
    if (message.videoError) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
          <div className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Vídeo não disponível
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                {message.videoError}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Cenário: Erro ao carregar o vídeo
    if (videoError) {
      const isN8nBinaryData = message.videoUrl?.includes('/rest/binary-data/');
      
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
          <div className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Erro ao carregar vídeo
              </p>
              <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 break-all">
                {videoError}
              </p>
              
              {isN8nBinaryData && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                    ⚠️ Configuração necessária no n8n
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    O endpoint /rest/binary-data/ do n8n requer autenticação e não é acessível pelo browser.
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                    <strong>Solução:</strong> Configure o workflow para fazer upload do vídeo para um serviço público (S3, Cloudflare R2, etc.) e retorne a URL pública em vez do binary data ID.
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2 break-all">
                URL: {message.videoUrl}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Cenário: Aguardando geração do vídeo
    if (message.isVideoLoading) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <div className="aspect-video flex flex-col items-center justify-center p-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary/60" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-primary">Gerando vídeo com Veo 3.1...</p>
            <p className="text-xs text-muted-foreground mt-1">Isso pode levar até 10 minutos</p>
          </div>
        </div>
      );
    }

    // Cenário: Vídeo disponível - renderiza player
    if (message.videoUrl) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden bg-black border border-border/50 shadow-lg">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              src={message.videoUrl}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                const error = video.error;
                let errorMsg = 'Erro desconhecido ao carregar vídeo';
                
                if (error) {
                  switch (error.code) {
                    case 1:
                      errorMsg = 'Download abortado pelo usuário';
                      break;
                    case 2:
                      errorMsg = 'Erro de rede - verifique a conexão com o n8n';
                      break;
                    case 3:
                      errorMsg = 'Erro ao decodificar vídeo - formato não suportado';
                      break;
                    case 4:
                      errorMsg = 'Vídeo não encontrado ou URL inválida';
                      break;
                    default:
                      errorMsg = `Erro ${error.code}: ${error.message || 'desconhecido'}`;
                  }
                }
                
                console.error('[Video Error]', {
                  error: errorMsg,
                  errorCode: error?.code,
                  src: message.videoUrl,
                  networkState: video.networkState,
                  readyState: video.readyState
                });
                setVideoError(errorMsg);
              }}
              controls
              controlsList="nodownload"
              playsInline
              crossOrigin="anonymous"
            />
          </div>
          <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                )}
              </button>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Vídeo gerado por IA</span>
          </div>
        </div>
      );
    }

    // Cenário A: Apenas texto - não renderiza nada
    return null;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }}
      className={`flex gap-2 md:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-tl-sm'
        }`}
      >
        {!isUser ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                code: ({ children }) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/20 pl-3 italic my-2">{children}</blockquote>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="leading-relaxed">{message.content}</p>
        )}

        {message.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-primary/20">
            <img
              src={message.imageUrl}
              alt="Imagem enviada"
              className="max-w-full h-auto max-h-48 object-contain"
            />
          </div>
        )}

        {!isUser && renderLegendas()}
        {!isUser && renderVideoPlayer()}

        <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${
          isUser ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
        }`}>
          {formatTime(message.timestamp)}
          {renderStatus()}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </motion.div>
  );
  }
);

MessageBubble.displayName = 'MessageBubble';
