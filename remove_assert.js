const fs = require("fs");
const path = require("path");

const dirPath = "src";

function processFile(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");

  // If file is empty, skip it
  if (!data.trim()) {
    return;
  }

  const newData = `// eslint-disable-next-line @typescript-eslint/ban-ts-comment\n// @ts-nocheck\n${data}`;

  fs.writeFileSync(filePath, newData);
}

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (let file of files) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      processDir(filePath);
    } else if (path.extname(filePath) === ".ts" || path.extname(filePath) === ".tsx") {
      processFile(filePath);
    }
  }
}

processDir(dirPath);
