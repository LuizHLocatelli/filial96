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

  // Add data-scroll-lock-ignore to the div that has the scroll classes
  content = content.replace(/(<div[^>]*className=["'][^"']*overflow-y-auto[^"']*["'])(?!.*data-scroll-lock-ignore)/g, '$1 data-scroll-lock-ignore');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files`);
