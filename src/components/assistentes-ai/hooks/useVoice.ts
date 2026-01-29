import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UseVoiceReturn } from '../types';

export function useVoice(): UseVoiceReturn {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const resultIndex = event.resultIndex;
          const result = event.results[resultIndex];
          if (result && result[0]) {
            const transcriptText = result[0].transcript;
            setTranscript(transcriptText);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error !== 'no-speech') {
            setError('Não foi possível capturar sua voz. Tente novamente.');
            toast({
              title: 'Erro no reconhecimento de voz',
              description: 'Não foi possível capturar sua voz. Tente novamente.',
              variant: 'destructive',
            });
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setSupported(true);
      } else {
        setSupported(false);
      }
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Erro ao iniciar gravação');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  }, []);

  return {
    isRecording,
    transcript,
    supported,
    startRecording,
    stopRecording,
    error
  };
}
