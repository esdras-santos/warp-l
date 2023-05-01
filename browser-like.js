const fs = require('fs');
const path = require('path');

const rootDir = './src/solc-typed-ast'; // Replace with the root directory of your project
const extension = '.ts'; // Replace with the file extension of your TypeScript files
const oldExt = '.js'; // Replace with the old file extension
const newExt = '.mjs'; // Replace with the new file extension

// Define the regular expression to match the import statement
const importRegex = /^import\s+{(.*)}\s+from\s+(['"])(.*?)\2;/gm;

// Walk through all the TypeScript files in the project
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith(extension)) {
      filelist.push(filepath);
    }
  });
  return filelist;
};
const files = walkSync(rootDir);

// Replace the import statements in each file and modify exports
files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Replace import statements
  const newCode = code.replace(importRegex, (match, functions, quote, importPath) => {
    // Append ".js" to the path if it has no extension
    const jsPath = importPath.includes('.') ? importPath.replace(/\.(\w+)$/, '') + '.ts' : `${importPath}.ts`;
    if (jsPath === 'cairoNodes.js') {
      // Move the imported functions to the end of the path if the imported path is "cairoNodes"
      const funcList = functions.trim().split(/\s*,\s*/);
      const newFuncList = funcList.map(func => `${func.trim()} as any`);
      return `import ${newFuncList.join(', ')} from ${quote}${jsPath}${quote};`;
    } else {
      // Otherwise, just replace the path with the modified path
      return match.replace(importPath, jsPath);
    }
  });
  
  if (newCode !== code) {
    fs.writeFileSync(file, newCode, 'utf8');
    code = newCode;
    modified = true;
  }
  
  // Modify exports
  const exportRegex = /^export\s+(default\s+)?(\{.*\})?\s+from\s+(['"])(.*?)\3;/gm;
  const exportCode = code.replace(exportRegex, (match, isDefault, exportList, quote, exportPath) => {
    // Replace the extension of the export path if it ends with the old extension
    const exportExt = path.extname(exportPath);
    if (exportExt === oldExt) {
      const newExportPath = exportPath.replace(oldExt, newExt);
      return `export ${isDefault ? 'default ' : ''}${exportList ? exportList + ' ' : ''}from ${quote}${newExportPath}${quote};`;
    } else {
      return match;
    }
  });
  
  if (exportCode !== code) {
    fs.writeFileSync(file, exportCode, 'utf8');
    modified = true;
  }
  
  if (modified) {
    console.log(`Modified ${file}`);
  }
});
