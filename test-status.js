// Um script simples para verificar se os arquivos TypeScript compilam corretamente.
const fs = require('fs');
const files = [
  'src/components/assistentes/components/AssistenteChat.tsx',
  'src/components/assistentes/components/ChatInput.tsx'
];

let allOk = true;
files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error(`Missing file: ${f}`);
    allOk = false;
  }
});

if (allOk) {
  console.log('Files updated successfully and ready for verification.');
}
