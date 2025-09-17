/**
 * Script de proteção pós-build
 * Executa transformações adicionais no código compilado
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Configuração de ofuscação
const obfuscationConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: true,
  debugProtectionInterval: 2000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Aplica ofuscação apenas se for arquivo JavaScript/TypeScript compilado
    if (code.includes('CalculadoraIgreen') || code.includes('iGreen')) {
      console.log(`🔒 Ofuscando arquivo: ${filePath}`);
      
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationConfig);
      fs.writeFileSync(filePath, obfuscatedCode.getObfuscatedCode());
      
      console.log(`✅ Arquivo ofuscado com sucesso: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao ofuscar arquivo ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (stat.isFile() && item.endsWith('.js')) {
        obfuscateFile(itemPath);
      }
    });
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
  }
}

function injectAdditionalProtection() {
  const distPath = path.join(__dirname, '../../dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    try {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Injeta proteções adicionais no HTML
      const protectionScript = `
        <script>
          // Proteção adicional anti-copy
          (function() {
            'use strict';
            
            // Detecta ferramentas de desenvolvimento
            let devtools = {open: false, orientation: null};
            setInterval(function() {
              if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                  devtools.open = true;
                  window.location.href = 'about:blank';
                }
              }
            }, 500);
            
            // Desabilita drag & drop
            document.addEventListener('dragstart', function(e) {
              e.preventDefault();
              return false;
            });
            
            // Desabilita print screen
            document.addEventListener('keyup', function(e) {
              if (e.keyCode == 44) {
                e.preventDefault();
                return false;
              }
            });
            
            // Limpa console constantemente
            setInterval(function() {
              console.clear();
            }, 1000);
            
            // Protege view-source
            if (window.location.protocol === 'view-source:') {
              window.location.href = 'about:blank';
            }
          })();
        </script>
      `;
      
      // Injeta antes do fechamento do head
      indexContent = indexContent.replace('</head>', protectionScript + '</head>');
      
      // Adiciona atributos de proteção ao body
      indexContent = indexContent.replace(
        '<body',
        '<body oncontextmenu="return false" onselectstart="return false" ondragstart="return false"'
      );
      
      fs.writeFileSync(indexPath, indexContent);
      console.log('✅ Proteções adicionais injetadas no index.html');
    } catch (error) {
      console.error('❌ Erro ao injetar proteções no HTML:', error.message);
    }
  }
}

// Executa proteção se executado diretamente
if (require.main === module) {
  console.log('🔒 Iniciando processo de proteção...');
  
  const distPath = path.join(__dirname, '../../dist');
  
  if (fs.existsSync(distPath)) {
    processDirectory(distPath);
    injectAdditionalProtection();
    console.log('✅ Processo de proteção concluído!');
  } else {
    console.error('❌ Diretório dist não encontrado. Execute o build primeiro.');
  }
}

module.exports = {
  obfuscateFile,
  processDirectory,
  injectAdditionalProtection
};
