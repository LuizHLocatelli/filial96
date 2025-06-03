
export const HUB_CONFIG = {
  // Timing configurations
  REFRESH_COOLDOWN: 2000, // 2 seconds
  RETRY_COUNT: 2,
  RETRY_DELAY: 2000, // 2 seconds
  
  // UI configurations
  ACTIVITIES_LIMIT: 20,
  ORIENTACOES_LIMIT: 10,
  TAREFAS_LIMIT: 10,
  
  // Performance thresholds
  PRODUTIVIDADE_META: 85,
  ORIENTACOES_RECENT_DAYS: 30,
  
  // Status mappings
  PERIODICIDADE_DAYS: {
    diario: 1,
    semanal: 7,
    mensal: 30
  }
} as const;

export const ERROR_MESSAGES = {
  ROTINAS: "Não foi possível carregar as rotinas",
  ORIENTACOES: "Não foi possível carregar as orientações", 
  TAREFAS: "Não foi possível carregar as tarefas",
  USUARIOS: "Não foi possível carregar os usuários",
  REFRESH: "Erro ao atualizar dados",
  GENERIC: "Ocorreu um erro inesperado"
} as const;
