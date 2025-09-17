/**
 * Sistema de Proteção ULTRA - Ofuscação Extrema
 * Aplicação de múltiplas camadas de criptografia e ofuscação
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const UglifyJS = require('uglify-js');
const crypto = require('crypto');

// Configuração de ofuscação EXTREMA
const ULTRA_OBFUSCATION_CONFIG = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  numbersToExpressions: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 5,
  stringArrayWrappersChainedCalls: true,
  stringArrayThreshold: 1,
  unicodeEscapeSequence: false,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 1,
  debugProtection: true,
  debugProtectionInterval: 1000,
  disableConsoleOutput: true,
  selfDefending: true,
  renameGlobals: true,
  renameProperties: true,
  renamePropertiesMode: 'unsafe',
  reservedNames: [],
  reservedStrings: [],
  seed: Math.floor(Math.random() * 1000000),
  sourceMap: false,
  sourceMapBaseUrl: '',
  sourceMapFileName: '',
  sourceMapMode: 'separate',
  splitStringsChunkLength: 5,
  transformObjectKeys: true,
  identifierNamesGenerator: 'hexadecimal',
  identifiersPrefix: '',
  ignoreRequireImports: false,
  log: false,
  target: 'browser'
};

class UltraProtection {
  constructor() {
    this.encryptionKey = crypto.randomBytes(32);
    this.iv = crypto.randomBytes(16);
  }

  /**
   * Aplica múltiplas camadas de ofuscação
   */
  multiLayerObfuscation(code) {
    console.log('🔄 Aplicando Camada 1: UglifyJS...');
    
    // Camada 1: UglifyJS - Minificação agressiva
    const uglified = UglifyJS.minify(code, {
      compress: {
        arguments: true,
        arrows: true,
        booleans: true,
        booleans_as_integers: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        dead_code: true,
        directives: true,
        drop_console: true,
        drop_debugger: true,
        ecma: 2020,
        evaluate: true,
        expression: true,
        global_defs: {},
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: true,
        if_return: true,
        inline: true,
        join_vars: true,
        keep_fargs: false,
        keep_infinity: false,
        loops: true,
        negate_iife: true,
        passes: 10,
        properties: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error', 'console.info'],
        pure_getters: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        top_retain: null,
        toplevel: true,
        typeofs: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        unused: true
      },
      mangle: {
        eval: true,
        keep_fnames: false,
        toplevel: true,
        safari10: false,
        properties: {
          regex: /.*/
        }
      },
      output: {
        ascii_only: true,
        beautify: false,
        comments: false,
        indent_level: 0,
        indent_start: 0,
        inline_script: true,
        keep_quoted_props: false,
        max_line_len: false,
        preamble: null,
        preserve_annotations: false,
        quote_keys: false,
        quote_style: 0,
        semicolons: true,
        shebang: true,
        webkit: false,
        wrap_iife: false,
        wrap_func_args: true
      }
    });

    if (uglified.error) {
      console.warn('⚠️ UglifyJS error:', uglified.error);
      return code;
    }

    console.log('🔄 Aplicando Camada 2: JavaScript Obfuscator...');
    
    // Camada 2: JavaScript Obfuscator - Ofuscação extrema
    const obfuscated = JavaScriptObfuscator.obfuscate(uglified.code, ULTRA_OBFUSCATION_CONFIG);
    
    console.log('🔄 Aplicando Camada 3: Criptografia customizada...');
    
    // Camada 3: Criptografia customizada
    return this.applyCustomEncryption(obfuscated.getObfuscatedCode());
  }

  /**
   * Aplica criptografia customizada ao código
   */
  applyCustomEncryption(code) {
    // XOR encryption com chave rotacional
    const encrypted = this.xorEncrypt(code);
    
    // Base64 múltiplo
    let result = encrypted;
    for (let i = 0; i < 3; i++) {
      result = Buffer.from(result).toString('base64');
    }
    
    // Wrapper com decodificação dinâmica
    return this.createDecryptionWrapper(result);
  }

  /**
   * XOR encryption
   */
  xorEncrypt(text) {
    const key = 'iGreenUltraSecure2024!@#$%^&*()';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  /**
   * Cria wrapper de descriptografia
   */
  createDecryptionWrapper(encryptedCode) {
    const wrapperCode = `
(function() {
  'use strict';
  
  // Anti-debugging
  var _0x1a2b = {
    check: function() {
      var start = +new Date();
      debugger;
      var end = +new Date();
      if (end - start > 100) {
        window.location.href = 'about:blank';
      }
    }
  };
  
  setInterval(_0x1a2b.check, 1000);
  
  // Detector de DevTools
  var _0x3c4d = function() {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      document.body.innerHTML = '';
      throw new Error('Access denied');
    }
  };
  
  setInterval(_0x3c4d, 500);
  
  // Console protection
  var _originalConsole = window.console;
  window.console = {
    log: function() { _0x1a2b.check(); },
    warn: function() { _0x1a2b.check(); },
    error: function() { _0x1a2b.check(); },
    info: function() { _0x1a2b.check(); },
    debug: function() { _0x1a2b.check(); }
  };
  
  // Decryption function
  function _0x5e6f(encrypted) {
    // Base64 decode (3 layers)
    var decoded = encrypted;
    for (var i = 0; i < 3; i++) {
      decoded = atob(decoded);
    }
    
    // XOR decrypt
    var key = 'iGreenUltraSecure2024!@#$%^&*()';
    var result = '';
    for (var j = 0; j < decoded.length; j++) {
      result += String.fromCharCode(decoded.charCodeAt(j) ^ key.charCodeAt(j % key.length));
    }
    
    return result;
  }
  
  // Execute decrypted code
  try {
    var _decrypted = _0x5e6f('${encryptedCode}');
    eval(_decrypted);
  } catch (e) {
    window.location.href = 'about:blank';
  }
})();`;

    return wrapperCode;
  }

  /**
   * Injeta proteções no HTML
   */
  injectHTMLProtections(htmlContent) {
    const protectionScript = `
<script>
// Ultra protection layer
(function() {
  'use strict';
  
  // Disable right click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);
  
  // Disable text selection
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  }, true);
  
  // Disable drag
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  }, true);
  
  // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      window.location.href = 'about:blank';
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      window.location.href = 'about:blank';
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      window.location.href = 'about:blank';
      return false;
    }
    
    // Ctrl+S (Save)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+A (Select All)
    if (e.ctrlKey && e.keyCode === 65) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+P (Print)
    if (e.ctrlKey && e.keyCode === 80) {
      e.preventDefault();
      return false;
    }
  }, true);
  
  // Hide when printing
  window.addEventListener('beforeprint', function() {
    document.body.style.display = 'none';
  });
  
  // Clear console constantly
  setInterval(function() {
    console.clear();
  }, 100);
  
  // Memory protection
  setInterval(function() {
    if (window.performance && window.performance.memory) {
      var memory = window.performance.memory;
      if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
        window.location.href = 'about:blank';
      }
    }
  }, 1000);
  
})();
</script>
`;

    // Injeta antes do fechamento do head
    return htmlContent.replace('</head>', protectionScript + '</head>');
  }

  /**
   * Processa arquivo JavaScript
   */
  processJavaScriptFile(filePath) {
    try {
      console.log(`🔐 Processando: ${filePath}`);
      
      const code = fs.readFileSync(filePath, 'utf8');
      
      // Aplica apenas em arquivos que contêm código da calculadora
      if (code.includes('CalculadoraIgreen') || 
          code.includes('extremeProtection') || 
          code.includes('iGreen') ||
          code.length > 10000) { // Arquivos grandes
        
        console.log(`🔥 Aplicando proteção ULTRA em: ${filePath}`);
        
        const protectedCode = this.multiLayerObfuscation(code);
        fs.writeFileSync(filePath, protectedCode);
        
        console.log(`✅ Arquivo protegido: ${filePath}`);
      } else {
        console.log(`⏭️ Pulando arquivo pequeno: ${filePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    }
  }

  /**
   * Processa diretório recursivamente
   */
  processDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          this.processDirectory(itemPath);
        } else if (stat.isFile() && item.endsWith('.js')) {
          this.processJavaScriptFile(itemPath);
        }
      });
      
    } catch (error) {
      console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
    }
  }

  /**
   * Executa proteção completa
   */
  execute() {
    console.log('🚀 Iniciando Sistema de Proteção ULTRA...');
    
    const distPath = path.join(__dirname, '../../dist');
    
    if (!fs.existsSync(distPath)) {
      console.error('❌ Diretório dist não encontrado. Execute o build primeiro.');
      return;
    }
    
    // 1. Processa arquivos JavaScript
    console.log('📦 Processando arquivos JavaScript...');
    this.processDirectory(distPath);
    
    // 2. Protege HTML
    console.log('🔧 Injetando proteções no HTML...');
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf8');
      const protectedHtml = this.injectHTMLProtections(htmlContent);
      fs.writeFileSync(indexPath, protectedHtml);
      console.log('✅ HTML protegido');
    }
    
    console.log('🔐 Sistema de Proteção ULTRA aplicado com sucesso!');
    console.log('⚠️  ATENÇÃO: O código agora está EXTREMAMENTE ofuscado e criptografado.');
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const ultraProtection = new UltraProtection();
  ultraProtection.execute();
}

module.exports = UltraProtection;
