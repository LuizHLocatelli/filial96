/**
 * Tipagens centralizadas para o módulo de Assistentes de IA
 */

export interface Chatbot {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  accept_images: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LegendasResponse {
  urgencia: string;
  beneficio: string;
  desejo: string;
}

export interface N8nFileData {
  fileExtension: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  id: string;
  mimeType: string;
}

export interface WebhookResponse {
  response?: {
    legendas?: LegendasResponse;
    videoUrl?: string;
    text?: string;
    message?: string;
    generate_video?: boolean;
    video_prompt?: string;
    videoError?: string;
  };
  videoUrl?: string;
  legendas?: LegendasResponse;
  text?: string;
  message?: string;
  output?: string;
  generate_video?: boolean;
  video_prompt?: string;
  videoError?: string;
}

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  legendas?: LegendasResponse;
  isVideoLoading?: boolean;
  videoError?: string;
  timestamp: string;
  isStreaming?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  chatbot_id: string;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface ChatbotFormData {
  name: string;
  webhookUrl: string;
  isActive: boolean;
  acceptImages: boolean;
}

export interface ChatInterfaceProps {
  chatbot: Chatbot;
  onBack: () => void;
}

export interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  onReply?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
}

export interface ChatInputProps {
  onSend: (message: string, imageFile?: File) => void;
  onVoiceInput?: (transcript: string) => void;
  disabled?: boolean;
  acceptImages?: boolean;
  placeholder?: string;
}

export interface ChatHeaderProps {
  chatbot: Chatbot;
  onBack: () => void;
  onClear: () => void;
  messageCount: number;
}

export interface ChatbotCardProps {
  chatbot: Chatbot;
  onChat: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isManager?: boolean;
}

export interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | 'active' | 'inactive';
  onFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
}

export interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export interface TypingIndicatorProps {
  className?: string;
}

export type FilterStatus = 'all' | 'active' | 'inactive';

export interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  isTyping: boolean;
  typingText: string;
  isVideoLoading: boolean;
  sendMessage: (content: string, imageFile?: File) => Promise<void>;
  retryMessage: () => void;
  clearConversation: () => Promise<void>;
  scrollToBottom: () => void;
}

export interface UseVoiceReturn {
  isRecording: boolean;
  transcript: string;
  supported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  error: string | null;
}
