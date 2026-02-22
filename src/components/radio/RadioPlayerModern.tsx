import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Radio, Play, Pause, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Visualizer Bar Component
const VisualizerBar = ({ delay, isPlaying }: { delay: number; isPlaying: boolean }) => (
  <motion.div
    className="w-1.5 bg-primary/80 rounded-full"
    animate={{
      height: isPlaying ? [12, 32, 16, 40, 24, 12] : 12,
    }}
    transition={{
      duration: 0.8,
      repeat: isPlaying ? Infinity : 0,
      repeatType: "reverse",
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

export function RadioPlayerModern() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const STREAM_URL = 'https://centova4.transmissaodigital.com:20129/stream';

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audio.volume = volume / 100;
    audioRef.current = audio;

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      const audioEl = e.target as HTMLAudioElement;
      let message = 'Erro ao carregar o stream';
      
      if (audioEl.error?.code === MediaError.MEDIA_ERR_NETWORK) {
        message = 'Erro de rede. Verifique sua conexão.';
      } else if (audioEl.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        message = 'Stream indisponível no momento.';
      }
      
      setIsPlaying(false);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro na Rádio",
        description: message,
      });
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      audioRef.current.src = STREAM_URL;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          setIsLoading(false);
          if (err.name === 'NotAllowedError') {
            toast({
              title: "Permissão necessária",
              description: "Clique no botão de play para ativar o áudio.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao reproduzir",
              description: "Não foi possível iniciar a reprodução.",
            });
          }
        });
      }
    }
  }, [isPlaying, toast]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <TooltipProvider>
      <motion.div
        className="glass-card max-w-[420px] w-full mx-auto p-6 md:p-8 flex flex-col items-center gap-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

        {/* Header Section */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner"
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              <Radio className="w-6 h-6" />
            </motion.div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold tracking-tight text-foreground m-0 leading-tight">Rádio Lebes</h3>
              <p className="text-sm text-muted-foreground font-medium">No ar, em toda parte.</p>
            </div>
          </div>
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20"
              >
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Ao vivo</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Player Section */}
        <div className="flex flex-col items-center w-full gap-8">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Background for Playing State */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className={cn(
                    "relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isPlaying 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_32px_rgba(var(--primary-rgb),0.3)]" 
                      : "bg-background border border-border hover:bg-muted text-foreground"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin opacity-80" />
                  ) : isPlaying ? (
                    <Pause className="w-10 h-10 fill-current opacity-90" />
                  ) : (
                    <Play className="w-10 h-10 ml-1.5 fill-current opacity-90" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                <p>{isPlaying ? 'Pausar rádio' : 'Tocar rádio'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Minimalist Audio Visualizer */}
          <div className="flex items-end justify-center gap-1.5 h-10 w-full">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((delay, i) => (
              <VisualizerBar key={i} delay={delay} isPlaying={isPlaying} />
            ))}
          </div>
        </div>

        {/* Volume Control Section */}
        <div className="w-full flex items-center gap-4 bg-muted/40 rounded-2xl p-4 border border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? 'Ativar som' : 'Silenciar'}</p>
            </TooltipContent>
          </Tooltip>

          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1 cursor-pointer"
          />

          <span className="text-xs font-semibold text-muted-foreground min-w-[32px] text-right tabular-nums">
            {isMuted ? 0 : volume}%
          </span>
        </div>
        
        {/* Status Text (Subtle) */}
        <AnimatePresence>
          {isPlaying && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-center text-muted-foreground w-full font-medium"
            >
              Transmitindo a melhor programação.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}
