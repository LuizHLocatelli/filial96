const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedCount = 0;

walkDir('./src', function(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add relative z-20 to the scrollable container to ensure it receives touch events
  content = content.replace(/flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain/g, 'flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain relative z-20');
  
  // Also fix useMobileDialog.tsx constant
  content = content.replace(/DIALOG_SCROLLABLE_CONTENT = "flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain/g, 'DIALOG_SCROLLABLE_CONTENT = "flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain relative z-20');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files`);
