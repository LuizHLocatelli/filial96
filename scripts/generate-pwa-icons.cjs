const fs = require('fs');
const path = require('path');

/**
 * Script para gerar ícones PWA em todos os tamanhos necessários
 * 
 * Para usar este script:
 * 1. Instale sharp: npm install sharp
 * 2. Execute: node scripts/generate-pwa-icons.cjs
 * 
 * Ou use um serviço online como:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

const maskableIcon = {
  size: 512,
  name: 'maskable-icon-512x512.png'
};

async function generateIcons() {
  try {
    // Verifica se o sharp está instalado
    const sharp = require('sharp');
    
    const inputSvg = path.join(__dirname, '../public/icons/icon-base.svg');
    const outputDir = path.join(__dirname, '../public/icons');

    // Cria o diretório se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Gerando ícones PWA...');

    // Gera ícones normais
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);
      
      await sharp(inputSvg)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Gerado: ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Gera ícone maskable (com padding extra)
    const maskableOutputPath = path.join(outputDir, maskableIcon.name);
    await sharp(inputSvg)
      .resize(416, 416) // 20% menor para deixar espaço de padding
      .extend({
        top: 48,
        bottom: 48,
        left: 48,
        right: 48,
        background: { r: 34, g: 197, b: 94, alpha: 1 }
      })
      .png()
      .toFile(maskableOutputPath);
      
    console.log(`✅ Gerado: ${maskableIcon.name} (maskable)`);
    console.log('🎉 Todos os ícones PWA foram gerados com sucesso!');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Sharp não encontrado. Instalando...');
      console.log('Execute: npm install sharp');
      console.log('Em seguida execute novamente: node scripts/generate-pwa-icons.cjs');
      console.log('');
      console.log('💡 Alternativa: Use um serviço online como:');
      console.log('- https://realfavicongenerator.net/');
      console.log('- https://www.pwabuilder.com/imageGenerator');
    } else {
      console.error('❌ Erro ao gerar ícones:', error);
    }
  }
}

function createPlaceholderIcons() {
  console.log('📝 Criando ícones placeholder...');
  
  const placeholderSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="256" fill="#22c55e"/>
  <circle cx="256" cy="256" r="200" fill="#ffffff" fill-opacity="0.1"/>
  <text x="256" y="280" font-family="Arial" font-size="120" font-weight="bold" text-anchor="middle" fill="white">96</text>
</svg>`;

  // Salva o SVG placeholder
  const outputDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outputDir, 'placeholder.svg'), placeholderSvg);
  
  console.log('✅ Ícone SVG placeholder criado');
  console.log('💡 Para gerar PNGs, execute: node scripts/generate-pwa-icons.cjs');
}

function copyPlaceholderAsPNGs() {
  console.log('📝 Copiando placeholder como PNGs temporários...');
  
  const sourcePath = path.join(__dirname, '../public/placeholder.svg');
  const outputDir = path.join(__dirname, '../public/icons');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Por enquanto, copia o placeholder existente como base para todos os tamanhos
  if (fs.existsSync(sourcePath)) {
    const sourceContent = fs.readFileSync(sourcePath);
    
    iconSizes.forEach(icon => {
      const outputPath = path.join(outputDir, icon.name);
      // Temporariamente copia o SVG como "PNG" até gerar os reais
      fs.writeFileSync(outputPath.replace('.png', '.svg'), sourceContent);
      console.log(`📋 Copiado placeholder para: ${icon.name.replace('.png', '.svg')}`);
    });
    
    // Maskable icon
    fs.writeFileSync(path.join(outputDir, maskableIcon.name.replace('.png', '.svg')), sourceContent);
    console.log(`📋 Copiado placeholder maskable: ${maskableIcon.name.replace('.png', '.svg')}`);
  }
  
  console.log('⚠️  Lembre-se de gerar os PNGs reais depois!');
}

// Executa a função apropriada
if (require.main === module) {
  if (process.argv.includes('--placeholder')) {
    createPlaceholderIcons();
    copyPlaceholderAsPNGs();
  } else {
    generateIcons();
  }
}

module.exports = { generateIcons, createPlaceholderIcons }; 