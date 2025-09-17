/**
 * Sistema de Proteção de Código - Calculadora iGreen
 * Múltiplas camadas de proteção contra cópia e engenharia reversa
 */

// Constantes ofuscadas
const PROTECTION_CONFIG = {
  // Chaves rotacionadas para verificação de integridade
  INTEGRITY_KEYS: [
    'iGr33n_C4lc_2024',
    'F1l14l96_S3cur3',
    'Pr0t3ct_C0d3_XYZ'
  ],
  
  // Intervalos de verificação (em ms)
  CHECK_INTERVALS: {
    DEVTOOLS: 1000,
    INTEGRITY: 3000,
    CONSOLE: 500
  },
  
  // Flags de proteção
  FLAGS: {
    DEVTOOLS_DETECTED: false,
    CONSOLE_CLEARED: false,
    SOURCE_PROTECTED: true
  }
};

/**
 * Classe principal de proteção
 */
export class CodeProtection {
  private static instance: CodeProtection;
  private intervalIds: number[] = [];
  private protectionActive = true;
  
  // Detectores de timing para DevTools
  private devToolsDetector: {
    start: number;
    threshold: number;
    checks: number;
  } = {
    start: 0,
    threshold: 100,
    checks: 0
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): CodeProtection {
    if (!CodeProtection.instance) {
      CodeProtection.instance = new CodeProtection();
    }
    return CodeProtection.instance;
  }

  /**
   * Inicializa todas as proteções
   */
  private initialize(): void {
    this.disableContextMenu();
    this.disableKeyboardShortcuts();
    this.disableTextSelection();
    this.protectConsole();
    this.detectDevTools();
    this.obfuscateGlobalMethods();
    this.monitorIntegrity();
    this.preventSourceAccess();
    this.injectDecoyCode();
  }

  /**
   * Desabilita menu de contexto (botão direito)
   */
  private disableContextMenu(): void {
    const preventContext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerFakeError();
      return false;
    };

    document.addEventListener('contextmenu', preventContext, true);
    document.addEventListener('selectstart', preventContext, true);
    document.addEventListener('dragstart', preventContext, true);
  }

  /**
   * Desabilita atalhos de teclado perigosos
   */
  private disableKeyboardShortcuts(): void {
    const dangerousKeys = [
      'F12', // DevTools
      'F10', // Menu
      'F5',  // Refresh
      'F3',  // Search
      'F1',  // Help
      'U',   // View Source (Ctrl+U)
      'S',   // Save (Ctrl+S)
      'A',   // Select All
      'P',   // Print
      'I',   // DevTools (Ctrl+Shift+I)
      'J',   // Console (Ctrl+Shift+J)
      'C',   // Console (Ctrl+Shift+C)
      'K'    // Console (Ctrl+Shift+K)
    ];

    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      
      // Detecta combinações perigosas
      if (
        dangerousKeys.includes(key) &&
        (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.triggerProtection();
        return false;
      }

      // F12 e outras teclas de função
      if (dangerousKeys.includes(key) && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.triggerProtection();
        return false;
      }
    }, true);
  }

  /**
   * Desabilita seleção de texto
   */
  private disableTextSelection(): void {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Protege e monitora console
   */
  private protectConsole(): void {
    // Limpa console constantemente
    const clearConsole = () => {
      if (typeof console !== 'undefined') {
        try {
          console.clear();
          console.log('%c', 'color: transparent;');
        } catch {}
      }
    };

    // Override métodos de console
    const originalMethods = ['log', 'warn', 'error', 'info', 'debug'];
    originalMethods.forEach(method => {
      if (console[method as keyof Console]) {
        (console as any)[method] = () => {};
      }
    });

    // Limpa console periodicamente
    this.intervalIds.push(
      window.setInterval(clearConsole, PROTECTION_CONFIG.CHECK_INTERVALS.CONSOLE)
    );
  }

  /**
   * Detecta DevTools aberto
   */
  private detectDevTools(): void {
    const detect = () => {
      this.devToolsDetector.start = performance.now();
      
      // Debugger detection
      const checkpoint = () => {
        const elapsed = performance.now() - this.devToolsDetector.start;
        if (elapsed > this.devToolsDetector.threshold) {
          this.devToolsDetector.checks++;
          if (this.devToolsDetector.checks > 3) {
            this.triggerProtection();
          }
        }
      };

      // Executa com debugger
      setTimeout(checkpoint, 10);
      
      // Console detection
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        this.triggerProtection();
      }
    };

    this.intervalIds.push(
      window.setInterval(detect, PROTECTION_CONFIG.CHECK_INTERVALS.DEVTOOLS)
    );
  }

  /**
   * Ofusca métodos globais importantes
   */
  private obfuscateGlobalMethods(): void {
    // Protege eval
    (window as any).eval = () => {
      this.triggerProtection();
      throw new Error('eval desabilitado');
    };

    // Protege Function constructor
    (window as any).Function = () => {
      this.triggerProtection();
      throw new Error('Function constructor desabilitado');
    };

    // Protege importação dinâmica
    if ('import' in window) {
      delete (window as any).import;
    }
  }

  /**
   * Monitora integridade do código
   */
  private monitorIntegrity(): void {
    const checkIntegrity = () => {
      // Verifica se scripts foram modificados
      const scripts = document.querySelectorAll('script');
      scripts.forEach((script, index) => {
        if (script.textContent && script.textContent.includes('debugger')) {
          this.triggerProtection();
        }
      });

      // Verifica elementos suspeitos
      const suspiciousElements = document.querySelectorAll('[id*="debug"], [class*="debug"], [data-debug]');
      if (suspiciousElements.length > 0) {
        this.triggerProtection();
      }
    };

    this.intervalIds.push(
      window.setInterval(checkIntegrity, PROTECTION_CONFIG.CHECK_INTERVALS.INTEGRITY)
    );
  }

  /**
   * Previne acesso ao código fonte
   */
  private preventSourceAccess(): void {
    // Sobrescreve view-source
    if ('location' in window) {
      const originalLocation = window.location.toString;
      (window.location as any).toString = () => {
        if (originalLocation().includes('view-source:')) {
          this.triggerProtection();
          return 'about:blank';
        }
        return originalLocation();
      };
    }

    // Monitora mudanças de URL
    window.addEventListener('popstate', () => {
      if (window.location.href.includes('view-source:')) {
        this.triggerProtection();
      }
    });
  }

  /**
   * Injeta código falso para confundir
   */
  private injectDecoyCode(): void {
    const decoyScript = document.createElement('script');
    decoyScript.textContent = `
      // Código falso para confundir
      const fakeCalculadora = {
        calcular: () => Math.random() * 1000,
        distribuidoras: ['fake1', 'fake2', 'fake3'],
        resultado: { economia: 0, elegivel: false }
      };
      
      // Função falsa
      function calcularFake() {
        return { error: 'Acesso negado' };
      }
      
      // Console fake
      window.calculadoraDebug = false;
    `;
    document.head.appendChild(decoyScript);
  }

  /**
   * Dispara erro falso para desencorajar
   */
  private triggerFakeError(): void {
    console.error('Acesso negado. Operação não permitida.');
  }

  /**
   * Ativa proteção quando detecção é triggered
   */
  private triggerProtection(): void {
    if (!this.protectionActive) return;

    // Redireciona ou bloqueia
    if (Math.random() > 0.5) {
      window.location.href = 'about:blank';
    } else {
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 24px;
          z-index: 999999;
        ">
          🔒 Acesso Restrito - Código Protegido
        </div>
      `;
    }
  }

  /**
   * Limpa todos os intervalos
   */
  public destroy(): void {
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
    this.protectionActive = false;
  }

  /**
   * Verifica se ambiente é seguro
   */
  public isSecureEnvironment(): boolean {
    return !PROTECTION_CONFIG.FLAGS.DEVTOOLS_DETECTED && 
           this.protectionActive &&
           typeof document !== 'undefined';
  }
}

/**
 * Função utilitária para verificar proteções
 */
export const initializeProtection = (): void => {
  // Só ativa em produção
  if (process.env.NODE_ENV === 'production') {
    const protection = CodeProtection.getInstance();
    
    // Proteção adicional: esconde o fato de que proteção está ativa
    Object.defineProperty(window, 'codeProtection', {
      get: () => undefined,
      configurable: false
    });
  }
};

/**
 * Hook para verificar se pode executar código sensível
 */
export const useCodeProtection = () => {
  // Em desenvolvimento, sempre permite execução
  if (process.env.NODE_ENV === 'development') {
    return {
      isSecure: true,
      canExecute: () => true
    };
  }
  
  // Em produção, usa verificações de segurança
  const protection = CodeProtection.getInstance();
  return {
    isSecure: protection.isSecureEnvironment(),
    canExecute: () => protection.isSecureEnvironment()
  };
};
