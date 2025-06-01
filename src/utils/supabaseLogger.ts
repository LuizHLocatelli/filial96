interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  operation: string;
  message: string;
  details?: any;
  duration?: number;
}

class SupabaseLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(level: LogEntry['level'], operation: string, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      details
    };

    this.logs.unshift(entry);
    
    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console log para desenvolvimento
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    };

    console.log(`${emoji[level]} [${operation}] ${message}`, details || '');
  }

  info(operation: string, message: string, details?: any) {
    this.log('info', operation, message, details);
  }

  warn(operation: string, message: string, details?: any) {
    this.log('warn', operation, message, details);
  }

  error(operation: string, message: string, details?: any) {
    this.log('error', operation, message, details);
  }

  debug(operation: string, message: string, details?: any) {
    this.log('debug', operation, message, details);
  }

  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(operation, 'Iniciando operação...');
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      // Atualizar o log com a duração
      if (this.logs.length > 0 && this.logs[0].operation === operation) {
        this.logs[0].duration = duration;
      }
      
      this.info(operation, `Concluído em ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(operation, `Falhou após ${duration}ms`, error);
      throw error;
    }
  }

  getLogs(filter?: { level?: LogEntry['level']; operation?: string }): LogEntry[] {
    let filtered = this.logs;

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.operation) {
      filtered = filtered.filter(log => log.operation.includes(filter.operation!));
    }

    return filtered;
  }

  getStats() {
    const stats = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDuration = this.logs
      .filter(log => log.duration)
      .reduce((sum, log, _, arr) => sum + (log.duration! / arr.length), 0);

    return {
      total: this.logs.length,
      byLevel: stats,
      averageDuration: Math.round(avgDuration)
    };
  }

  clear() {
    this.logs = [];
    this.info('Logger', 'Logs limpos');
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância singleton
export const supabaseLogger = new SupabaseLogger();

// Helper para operações específicas
export const logSupabaseOperation = {
  auth: {
    signup: (message: string, details?: any) => supabaseLogger.info('AUTH.SIGNUP', message, details),
    login: (message: string, details?: any) => supabaseLogger.info('AUTH.LOGIN', message, details),
    logout: (message: string, details?: any) => supabaseLogger.info('AUTH.LOGOUT', message, details),
    error: (message: string, details?: any) => supabaseLogger.error('AUTH', message, details),
  },
  
  database: {
    select: (table: string, message: string, details?: any) => supabaseLogger.info(`DB.SELECT.${table.toUpperCase()}`, message, details),
    insert: (table: string, message: string, details?: any) => supabaseLogger.info(`DB.INSERT.${table.toUpperCase()}`, message, details),
    update: (table: string, message: string, details?: any) => supabaseLogger.info(`DB.UPDATE.${table.toUpperCase()}`, message, details),
    delete: (table: string, message: string, details?: any) => supabaseLogger.info(`DB.DELETE.${table.toUpperCase()}`, message, details),
    error: (operation: string, message: string, details?: any) => supabaseLogger.error(`DB.${operation.toUpperCase()}`, message, details),
  },

  profile: {
    create: (message: string, details?: any) => supabaseLogger.info('PROFILE.CREATE', message, details),
    update: (message: string, details?: any) => supabaseLogger.info('PROFILE.UPDATE', message, details),
    fetch: (message: string, details?: any) => supabaseLogger.info('PROFILE.FETCH', message, details),
    error: (message: string, details?: any) => supabaseLogger.error('PROFILE', message, details),
  }
}; 