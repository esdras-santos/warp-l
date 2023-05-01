// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { isValidSolFile } from '../io.ts';
import { compileSolFiles } from '../solCompile.ts';
import { DefaultASTPrinter } from './astPrinter.ts';

export type PrintOptions = {
  highlight?: string[];
  stubs?: boolean;
};

export function analyseSol(file: string, options: PrintOptions) {
  if (!isValidSolFile(file)) {
    console.log(`${file} is not a valid solidity file`);
  }

  DefaultASTPrinter.applyOptions(options);

  compileSolFiles([file], { warnings: true }).roots.forEach((root) => {
    console.log(`---${root.absolutePath}---`);
    console.log(DefaultASTPrinter.print(root));
  });
}
