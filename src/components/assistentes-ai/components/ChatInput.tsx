import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '../hooks/useVoice';
import type { ChatInputProps } from '../types';

export function ChatInput({
  onSend,
  onVoiceInput,
  disabled = false,
  acceptImages = false,
  placeholder = 'Digite sua mensagem...'
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, transcript, supported, startRecording, stopRecording } = useVoice();

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setSelectedImage(objectUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImageFile(null);
  }, []);

  const handleSend = useCallback(() => {
    if ((!inputMessage.trim() && !imageFile) || disabled) return;
    
    onSend(inputMessage.trim(), imageFile || undefined);
    setInputMessage('');
    setSelectedImage(null);
    setImageFile(null);
  }, [inputMessage, imageFile, disabled, onSend]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const canSend = (inputMessage.trim() || imageFile) && !disabled;

  return (
    <div className="p-3 md:p-4 bg-background/80 dark:bg-background/60 backdrop-blur-xl border-t border-border/50">
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 flex items-center gap-3 bg-primary/5 dark:bg-primary/10 p-2 rounded-xl max-w-xs mx-auto"
          >
            <div className="relative">
              <img
                src={selectedImage}
                alt="Prévia"
                className="h-14 w-14 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground flex-1 truncate">
              Imagem anexada
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {acceptImages && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
              id="chat-image-input"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={`h-11 w-11 rounded-xl shrink-0 transition-all duration-200 ${
                selectedImage 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </>
        )}

        {supported && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`h-11 w-11 rounded-xl shrink-0 transition-all duration-200 ${
              isRecording 
                ? 'text-red-500 bg-red-500/10 animate-pulse' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {isRecording ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
        )}

        <div className="flex-1 relative">
          <input
            type="text"
            value={isRecording ? transcript : inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? 'Ouvindo...' : placeholder}
            disabled={disabled || isRecording}
            className="w-full px-4 py-3 bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all text-sm md:text-base placeholder:text-muted-foreground/60"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className={`h-11 w-11 rounded-xl transition-all duration-200 shrink-0 ${
            canSend 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
