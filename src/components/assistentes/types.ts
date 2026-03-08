export interface AIAssistant {
  id: string;
  user_id: string;
  name: string;
  description: string;
  system_message: string;
  avatar_icon: string;
  created_at: string;
  updated_at: string;
  web_search_enabled?: boolean;
}

export interface AIChatSession {
  id: string;
  assistant_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIChatMessage {
  id: string;
  session_id: string;
  role: "user" | "model";
  content: string;
  image_urls: string[];
  tools_used?: string[];
  created_at: string;
}
