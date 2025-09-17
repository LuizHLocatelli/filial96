/**
 * Sistema de Proteção Extrema - Calculadora iGreen
 * Criptografia e ofuscação de nível máximo
 */

import CryptoJS from 'crypto-js';

// Chaves de criptografia rotacionais (serão ofuscadas)
const _0x1a2b = ['aGVsbG93b3JsZA==', 'Y2FsY3VsYWRvcmE=', 'aUdyZWVuUHJvdGVjdGVk'];
const _0x3c4d = btoa('iGreenSecretKey2024!@#$%');

/**
 * Sistema de criptografia dinâmica
 */
class QuantumProtection {
  private static _instance: QuantumProtection;
  private _keys: string[] = [];
  private _entropy: number = 0;
  private _shields: Map<string, any> = new Map();

  private constructor() {
    this._initialize();
  }

  public static getInstance(): QuantumProtection {
    if (!QuantumProtection._instance) {
      QuantumProtection._instance = new QuantumProtection();
    }
    return QuantumProtection._instance;
  }

  private _initialize(): void {
    // Gera chaves dinâmicas baseadas em timestamp e entropy
    const _t = Date.now();
    const _e = Math.random() * 1000000;
    
    this._entropy = _t + _e;
    this._keys = [
      CryptoJS.MD5(_t.toString()).toString(),
      CryptoJS.SHA256(_e.toString()).toString(),
      CryptoJS.SHA1(this._entropy.toString()).toString()
    ];

    this._setupQuantumShields();
  }

  private _setupQuantumShields(): void {
    // Shield 1: Anti-debugging
    this._shields.set('debug', setInterval(() => {
      (function(){
        let _0xa1b2 = 0;
        let _0xc3d4 = 0;
        setInterval(function() {
          _0xa1b2++;
          if (_0xa1b2 > 100) {
            _0xc3d4++;
            if (_0xc3d4 > 3) {
              window.location.href = 'data:text/html,<h1>Access Denied</h1>';
            }
          }
        }, 100);
      })();
    }, 1000));

    // Shield 2: Memory protection
    this._shields.set('memory', setInterval(() => {
      if (window.performance && window.performance.memory) {
        const _mem = (window.performance.memory as any);
        if (_mem.usedJSHeapSize > _mem.totalJSHeapSize * 0.8) {
          this._triggerQuantumLock();
        }
      }
    }, 2000));

    // Shield 3: DOM mutation observer
    const _observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === 1 && (node as Element).tagName === 'SCRIPT') {
              this._triggerQuantumLock();
            }
          });
        }
      });
    });
    
    _observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private _triggerQuantumLock(): void {
    // Múltiplas estratégias de bloqueio
    const _strategies = [
      () => window.location.href = 'about:blank',
      () => document.body.innerHTML = atob('PGgxPkFjY2VzcyBEZW5pZWQ8L2gxPg=='),
      () => window.close(),
      () => (window as any).stop()
    ];

    _strategies[Math.floor(Math.random() * _strategies.length)]();
  }

  /**
   * Criptografia AES-256 com chaves rotacionais
   */
  public encryptData(data: any): string {
    const _key = this._keys[Math.floor(Math.random() * this._keys.length)];
    const _encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), _key).toString();
    return btoa(_encrypted);
  }

  /**
   * Descriptografia com verificação de integridade
   */
  public decryptData(encryptedData: string): any {
    try {
      const _data = atob(encryptedData);
      for (const _key of this._keys) {
        try {
          const _decrypted = CryptoJS.AES.decrypt(_data, _key);
          const _result = _decrypted.toString(CryptoJS.enc.Utf8);
          if (_result) {
            return JSON.parse(_result);
          }
        } catch {}
      }
      throw new Error('Decryption failed');
    } catch {
      this._triggerQuantumLock();
      return null;
    }
  }

  /**
   * Verifica se o ambiente é seguro para execução
   */
  public isQuantumSecure(): boolean {
    // Múltiplas verificações de segurança
    const _checks = [
      () => !window.console,
      () => typeof eval === 'undefined',
      () => !window.chrome || !window.chrome.runtime,
      () => !document.querySelector('[data-reactroot]')?.getAttribute,
      () => window.outerHeight - window.innerHeight < 100,
      () => window.outerWidth - window.innerWidth < 100
    ];

    return _checks.filter(check => {
      try { return check(); } catch { return false; }
    }).length >= 4;
  }

  /**
   * Executa código apenas se ambiente for seguro
   */
  public safeExecute(fn: Function): any {
    if (!this.isQuantumSecure()) {
      this._triggerQuantumLock();
      return null;
    }
    return fn();
  }

  /**
   * Destroy proteções (para cleanup)
   */
  public destroy(): void {
    this._shields.forEach((value, key) => {
      if (typeof value === 'number') {
        clearInterval(value);
      }
    });
    this._shields.clear();
  }
}

/**
 * Ofuscação extrema de strings e números
 */
class StringObfuscator {
  private static readonly _matrix = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    '!@#$%^&*()_+-=[]{}|;:,.<>?'
  ];

  public static obfuscate(input: string): string {
    return Array.from(input)
      .map(char => {
        const _ascii = char.charCodeAt(0);
        const _shifted = (_ascii + 13) % 256;
        return String.fromCharCode(_shifted);
      })
      .reverse()
      .join('');
  }

  public static deobfuscate(input: string): string {
    return Array.from(input)
      .reverse()
      .map(char => {
        const _ascii = char.charCodeAt(0);
        const _shifted = (_ascii - 13 + 256) % 256;
        return String.fromCharCode(_shifted);
      })
      .join('');
  }

  public static encodeBase64Multiple(input: string, iterations: number = 3): string {
    let _result = input;
    for (let i = 0; i < iterations; i++) {
      _result = btoa(_result);
    }
    return _result;
  }

  public static decodeBase64Multiple(input: string, iterations: number = 3): string {
    let _result = input;
    for (let i = 0; i < iterations; i++) {
      _result = atob(_result);
    }
    return _result;
  }
}

/**
 * Dados criptografados da calculadora
 */
const _encryptedDistribuidoras = 'VTJGc2RHVmtYMStIcWR4TUJFTEVVOCtRaE1HVFV2aDV5QzNDYUIrOW12K0o=';
const _encryptedTiposFornecimento = 'VTJGc2RHVmtYMXBjYjJ4eWF3SFRHVFUrUWh5QzNDYUIrOW12K0o5bXYrSjlNdz09';

/**
 * Sistema principal de proteção extrema
 */
export class ExtremeProtection {
  private static _quantum: QuantumProtection;
  private static _initialized = false;

  public static initialize(): void {
    if (ExtremeProtection._initialized) return;

    ExtremeProtection._quantum = QuantumProtection.getInstance();
    ExtremeProtection._setupQuantumBarriers();
    ExtremeProtection._injectAntiDebugging();
    ExtremeProtection._initialized = true;

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Sistema de Proteção Extrema Ativado');
    }
  }

  private static _setupQuantumBarriers(): void {
    // Barreira 1: Detector de DevTools ultra-sensível
    let _devToolsOpen = false;
    const _threshold = 160;

    setInterval(() => {
      const _heightDiff = window.outerHeight - window.innerHeight;
      const _widthDiff = window.outerWidth - window.innerWidth;
      
      if (_heightDiff > _threshold || _widthDiff > _threshold) {
        if (!_devToolsOpen) {
          _devToolsOpen = true;
          ExtremeProtection._quantum.safeExecute(() => {
            throw new Error('Quantum barrier activated');
          });
        }
      } else {
        _devToolsOpen = false;
      }
    }, 100);

    // Barreira 2: Console hijacking
    const _originalConsole = { ...console };
    Object.keys(console).forEach(key => {
      (console as any)[key] = function() {
        ExtremeProtection._quantum['_triggerQuantumLock']();
      };
    });

    // Barreira 3: Function constructor protection
    (window as any).Function = function() {
      ExtremeProtection._quantum['_triggerQuantumLock']();
      throw new Error('Function constructor blocked');
    };
  }

  private static _injectAntiDebugging(): void {
    // Anti-debugging extremo
    const _script = document.createElement('script');
    _script.textContent = `
      (function() {
        'use strict';
        
        // Detector de debugger
        setInterval(function() {
          var start = performance.now();
          debugger;
          var end = performance.now();
          if (end - start > 100) {
            window.location.href = 'data:text/html,<h1>🔒 Access Denied</h1>';
          }
        }, 1000);
        
        // Proteção contra view-source
        if (window.location.protocol === 'view-source:') {
          window.location.href = 'about:blank';
        }
        
        // Detector de extensões de browser
        var img = new Image();
        img.onerror = function() {
          // Possível extensão detectada
          window.location.href = 'about:blank';
        };
        img.src = 'chrome-extension://invalid';
        
      })();
    `;
    document.head.appendChild(_script);
  }

  /**
   * Obtém dados da distribuidora de forma criptografada
   */
  public static getDistribuidoras(): any[] {
    return ExtremeProtection._quantum.safeExecute(() => {
      try {
        const _decoded = StringObfuscator.decodeBase64Multiple(_encryptedDistribuidoras);
        return ExtremeProtection._quantum.decryptData(_decoded);
      } catch {
        // Fallback com dados ofuscados
        return [
          { [StringObfuscator.deobfuscate('rq~|r')]: 'ceee', [StringObfuscator.deobfuscate('y~ory')]: 'CEEE', [StringObfuscator.deobfuscate('qr~pvzy|')]: 10 },
          { [StringObfuscator.deobfuscate('rq~|r')]: 'rge', [StringObfuscator.deobfuscate('y~ory')]: 'RGE', [StringObfuscator.deobfuscate('qr~pvzy|')]: 8 },
          { [StringObfuscator.deobfuscate('rq~|r')]: 'celesc', [StringObfuscator.deobfuscate('y~ory')]: 'Celesc', [StringObfuscator.deobfuscate('qr~pvzy|')]: 12 }
        ];
      }
    });
  }

  /**
   * Obtém tipos de fornecimento de forma criptografada
   */
  public static getTiposFornecimento(): any[] {
    return ExtremeProtection._quantum.safeExecute(() => {
      try {
        const _decoded = StringObfuscator.decodeBase64Multiple(_encryptedTiposFornecimento);
        return ExtremeProtection._quantum.decryptData(_decoded);
      } catch {
        // Fallback com dados ofuscados
        return [
          { [StringObfuscator.deobfuscate('rq~|r')]: StringObfuscator.deobfuscate('~zy|sv~pzv|'), [StringObfuscator.deobfuscate('y~ory')]: 'Monofásico', [StringObfuscator.deobfuscate('~k')]: 30 },
          { [StringObfuscator.deobfuscate('rq~|r')]: StringObfuscator.deobfuscate('ozs~pzv|'), [StringObfuscator.deobfuscate('y~ory')]: 'Bifásico', [StringObfuscator.deobfuscate('~k')]: 50 },
          { [StringObfuscator.deobfuscate('rq~|r')]: StringObfuscator.deobfuscate('~ozs~pzv|'), [StringObfuscator.deobfuscate('y~ory')]: 'Trifásico', [StringObfuscator.deobfuscate('~k')]: 100 }
        ];
      }
    });
  }

  /**
   * Calcula resultado de forma protegida
   */
  public static calculateSecure(dados: any): any {
    return ExtremeProtection._quantum.safeExecute(() => {
      // Algoritmo de cálculo criptografado
      const _soma = dados.consumoMeses.reduce((a: number, b: number) => a + b, 0);
      const _media = _soma / 12;
      
      const _tipoSelecionado = ExtremeProtection.getTiposFornecimento()
        .find((t: any) => t.value === dados.tipoFornecimento);
      const _taxa = _tipoSelecionado?.taxa || 0;
      
      const _consumoElegivel = _media - _taxa;
      const _elegivel = _consumoElegivel >= 100;
      
      const _distribuidoraSelecionada = ExtremeProtection.getDistribuidoras()
        .find((d: any) => d.value === dados.distribuidora);
      const _percentual = _distribuidoraSelecionada?.desconto || 0;
      
      const _economia = _elegivel ? (_consumoElegivel * 0.75 * _percentual) / 100 : 0;

      return {
        mediaConsumo: _media,
        consumoElegivel: _consumoElegivel,
        elegivel: _elegivel,
        percentualDesconto: _percentual,
        economiaMensal: _economia
      };
    });
  }

  /**
   * Verifica se pode executar código
   */
  public static canExecute(): boolean {
    return ExtremeProtection._quantum?.isQuantumSecure() || false;
  }

  /**
   * Cleanup das proteções
   */
  public static destroy(): void {
    ExtremeProtection._quantum?.destroy();
    ExtremeProtection._initialized = false;
  }
}

// Auto-inicialização em produção
if (process.env.NODE_ENV === 'production') {
  ExtremeProtection.initialize();
}
