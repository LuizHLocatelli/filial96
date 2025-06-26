const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configurações dos ícones necessários para PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // Ícones adicionais necessários
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 57, name: 'icon-57x57.png' },
  { size: 60, name: 'icon-60x60.png' },
  { size: 76, name: 'icon-76x76.png' },
  { size: 114, name: 'icon-114x114.png' },
  { size: 120, name: 'icon-120x120.png' }
];

async function generateIconsFromImage() {
  try {
    console.log('🎨 Gerando ícones PWA a partir da imagem EXATA fornecida...');
    
    const inputImagePath = './public/icons/logo-original.png';
    const outputDir = './public/icons/';
    
    // Verificar se a imagem de entrada existe
    if (!fs.existsSync(inputImagePath)) {
      console.error('❌ Imagem original não encontrada em:', inputImagePath);
      console.log('📋 Por favor, salve o ícone fornecido como: ./public/icons/logo-original.png');
      return;
    }
    
    console.log('📸 Usando imagem original:', inputImagePath);
    
    // Gerar todos os tamanhos
    for (const icon of iconSizes) {
      await sharp(inputImagePath)
        .resize(icon.size, icon.size, {
          fit: 'cover',
          position: 'center'
        })
        .png({
          quality: 100,
          compressionLevel: 0
        })
        .toFile(path.join(outputDir, icon.name));
      
      console.log(`✅ Gerado: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    // Gerar ícone maskable (formato especial para Android)
    await sharp(inputImagePath)
      .resize(512, 512)
      .png({ quality: 100 })
      .toFile(path.join(outputDir, 'maskable-icon-512x512.png'));
    
    console.log('✅ Gerado: maskable-icon-512x512.png (maskable)');
    
    // Gerar favicon.ico
    await sharp(inputImagePath)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon.png');
    
    console.log('✅ Gerado: favicon.png');
    console.log('🎉 Todos os ícones PWA foram gerados com sucesso a partir da imagem EXATA!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
  }
}

generateIconsFromImage(); 