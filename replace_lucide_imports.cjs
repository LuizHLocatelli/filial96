const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetAlias = '@/components/ui/emoji-icons';

let updatedCount = 0;

walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('lucide-react')) {
      let newContent = content.replace(/from "lucide-react"/g, 'from "' + targetAlias + '"');
      newContent = newContent.replace(/from 'lucide-react'/g, "from '" + targetAlias + "'");
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        updatedCount++;
        console.log('Updated', filePath);
      }
    }
  }
});
console.log('Total files updated:', updatedCount);
