const fs = require('fs');
const path = require('path');

const rootDir = './src'; // change this to the root directory of your project
const excludeDirs = ['node_modules']; // change this if you want to exclude other directories

const regex = /import\s*\{\s*([\w\s,]+)\s*\}\s*from\s*'npm:solc-typed-ast@[^']*'/g;

function removeSolcTypedAstImports(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const newFileContent = fileContent.replace(regex, '');
  fs.writeFileSync(filePath, newFileContent);
}

function traverseDirectory(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    if (fs.statSync(filePath).isDirectory() && !excludeDirs.includes(file)) {
      traverseDirectory(filePath);
    } else if (fs.statSync(filePath).isFile()) {
      const extname = path.extname(filePath);
      if (extname === '.ts' || extname === '.tsx') {
        removeSolcTypedAstImports(filePath);
      }
    }
  }
}

traverseDirectory(rootDir);
