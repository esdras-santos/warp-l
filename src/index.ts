// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
import { outputResult } from "./io.ts";
import { compileSolFiles } from "./solCompile.ts";
import { handleTranspilationError, transpile } from "./transpiler.ts";

const dirPath = Deno.args[0].split('/')
dirPath.pop()

const options = {
    dev: false,
    outputDir: dirPath.join('/'),
    debugInfo: false,
    stubs: true,
    strict: true,
    warnings: false,
    compileCairo: false,
    formatCairo: false
  }

const ast = compileSolFiles([Deno.args[0]], options);

try {
    transpile(ast, options)
    .map(([fileName, cairoCode]) => {
        outputResult(path.parse(fileName).name, fileName, cairoCode, options, ast);
        return fileName;
    })
    
} catch (e) {
    handleTranspilationError(e);
}
