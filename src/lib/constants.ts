// Constantes de API e configuração

export const API_ENDPOINTS = {
  // Proxy Supabase para N8N (resolve problemas de CORS)
  N8N_PROXY: "https://abpsafkioslfjqtgtvbi.supabase.co/functions/v1/n8n-proxy",
  
  // URL original do N8N (para referência - não usar diretamente do frontend)
  N8N_WEBHOOK_ORIGINAL: "https://filial96.app.n8n.cloud/webhook/44a765ab-fb44-44c3-ab75-5ec334b9cda0",
} as const;

export const CORS_CONFIG = {
  // Headers padrão para requisições que precisam de CORS
  headers: {
    'Content-Type': 'application/json',
    // Autorização para Edge Function do Supabase
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicHNhZmtpb3NsZmpxdGd0dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Njg3ODIsImV4cCI6MjA2MTU0NDc4Mn0.UTF4Gi6rDxQ2a3Pf4J2-7J0yPokcks6J8xO93GEhk-w',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicHNhZmtpb3NsZmpxdGd0dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Njg3ODIsImV4cCI6MjA2MTU0NDc4Mn0.UTF4Gi6rDxQ2a3Pf4J2-7J0yPokcks6J8xO93GEhk-w'
  },
  // Configurações de timeout
  timeout: 30000, // 30 segundos
} as const; 