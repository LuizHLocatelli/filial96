import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import './RadioPlayerModern.css';

// Visualizer Bar Component
const VisualizerBar = ({ delay, isPlaying }: { delay: number; isPlaying: boolean }) => (
  <motion.div
    className="visualizer-bar"
    animate={{
      height: isPlaying ? [8, 24, 12, 32, 16, 8] : 4,
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

// Live Indicator Component
const LiveIndicator = () => (
  <div className="live-indicator">
    <motion.span
      className="live-dot"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <span className="live-text">Ao vivo</span>
  </div>
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
        className="radio-modern-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Logo */}
        <div className="radio-modern-header">
          <motion.div
            className="radio-icon-wrapper"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 20,
              repeat: isPlaying ? Infinity : 0,
              ease: "linear",
            }}
          >
            <Radio className="radio-icon" />
          </motion.div>
          <div className="radio-title-wrapper">
            <h3 className="radio-title">Rádio Lebes</h3>
            <AnimatePresence>
              {isPlaying && <LiveIndicator />}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Player Controls */}
        <div className="radio-modern-player">
          {/* Play/Pause Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={togglePlay}
                disabled={isLoading}
                className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      className="spinner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  ) : isPlaying ? (
                    <motion.svg
                      key="pause"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="play"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M8 5v14l11-7z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? 'Pausar' : 'Tocar'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Audio Visualizer */}
          <div className="visualizer">
            {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
              <VisualizerBar key={i} delay={delay} isPlaying={isPlaying} />
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="volume-control">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={toggleMute}
                className="volume-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="volume-icon" />
                ) : (
                  <Volume2 className="volume-icon" />
                )}
              </motion.button>
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
            className="volume-slider"
          />

          <span className="volume-value">
            {isMuted ? 0 : volume}%
          </span>
        </div>

        {/* Status Bar */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="status-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="status-text">
                Transmitindo: Rádio Lebes - Programação ao vivo
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}
