// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
import { TranspileFailedError, logError } from './utils/errors.ts';
import { AST } from './ast/ast.ts';
import { outputFileSync } from './utils/fs.ts';
import { TranspilationOptions } from './transpiler.ts';


export type OutputOptions = {
  compileCairo?: boolean;
  outputDir: string;
  formatCairo: boolean;
};

export function isValidSolFile(path: string, printError = true): boolean {
  Deno.stat(path).then((fileInfo)=>{
    if (!fileInfo.isFile) {
      if (printError) logError(`${path} is not a file`);
      return false;
    }
  })
  // if (!fs.existsSync(path)) {
  //   if (printError) logError(`${path} doesn't exist`);
  //   return false;
  // }
  if (!path.endsWith('.sol')) {
    if (printError) logError(`${path} is not a solidity source file`);
    return false;
  }
  
  return true;
}

export function findSolSourceFilePaths(targetPath: string, recurse: boolean): string[] {
  return findAllFiles(targetPath, recurse).filter((path) => path.endsWith('.sol'));
}

export function findCairoSourceFilePaths(targetPath: string, recurse: boolean): string[] {
  return findAllFiles(targetPath, recurse).filter((path) => path.endsWith('.cairo'));
}

export function findAllFiles(targetPath: string, recurse: boolean): string[] {
  let files: string[] = [];
  Deno.stat(targetPath).then((fileInfo)=>{
    if (fileInfo.isDirectory) {
      files = evaluateDirectory(targetPath, recurse);
    } else if (fileInfo.isFile) {
      files = [targetPath];
    } else {
      console.log(`WARNING: Found ${targetPath}, which is neither a file nor directory`);
      files = [];
    }  
  })
  return files;
}

function evaluateDirectory(path: string, recurse: boolean): string[] {
  const dirs = Deno.readDirSync(path);
  let files: string[] = [];
  for(let dirEntry of dirs){
    if (!recurse && dirEntry.isDirectory) {
      files = [];
    } else {
      files = findAllFiles(`${path}/${dirEntry.name}`, recurse);
    }
  }
  return files;
}

export function replaceSuffix(filePath: string, suffix: string): string {
  const parsedPath = path.parse(filePath);
  return path.join(parsedPath.dir, `${parsedPath.name}${suffix}`);
}

export function outputResult(
  contractName: string,
  outputPath: string,
  code: string,
  options: OutputOptions & TranspilationOptions,
  ast: AST,
): void {
  if (options.outputDir !== undefined) {
    Deno.stat(options.outputDir).then((fileInfo)=>{
      if (!fileInfo.isDirectory) {
        throw new TranspileFailedError(
          `Cannot output to ${options.outputDir}. Output-dir must be a directory`,
        );
      }
    })

    const outputLocation = path.parse(path.join(options.outputDir, outputPath));
    const metadataLocation = path.dirname(outputLocation.dir);

    const abiOutPath = path.join(metadataLocation, `${outputLocation.name}_sol_abi.json`);

    const solFilePath = path.dirname(path.dirname(outputPath));
    outputFileSync(
      abiOutPath,
      JSON.stringify(ast.solidityABI.contracts[solFilePath][contractName]['abi'], null, 2),
    );

    const codeOutPath = path.join(outputLocation.dir, outputLocation.base);
    outputFileSync(codeOutPath, code);
    // Cairo-format is disabled, as it has a bug
    // if (options.formatCairo || options.dev) {
    //   const warpVenvPrefix = `PATH=${path.resolve(__dirname, '..', 'warp_venv', 'bin')}:$PATH`;
    //   execSync(`${warpVenvPrefix} cairo-format -i ${fullCodeOutPath}`);
    // }
  } else {
    console.log(`//--- ${outputPath} ---\n${code}\n//---`);
  }
}
