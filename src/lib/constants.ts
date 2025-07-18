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
  timeout: 300000, // 5 minutos
} as const;

// Theme constants
export const THEME_STORAGE_KEY = 'theme-preference';

// API constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];

// Date constants
export const DEPOSIT_SYSTEM_START_DATE = new Date(2025, 5, 18); // 18 de junho de 2025 (início do uso do sistema de depósitos)

// Navigation constants
export const NAVIGATION_TRANSITIONS = {
  DURATION: 200,
  EASING: 'ease-in-out'
} as const; 