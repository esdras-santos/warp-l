// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { generateFile, PATH_TO_WARPLIB, WarplibFunctionInfo } from './utils.ts';
import { int_conversions } from './implementations/conversions/int.ts';
import { div_signed, div_signed_unsafe } from './implementations/maths/div.ts';
import { exp, exp_signed, exp_signed_unsafe, exp_unsafe } from './implementations/maths/exp.ts';
import { negate } from './implementations/maths/negate.ts';
import { shl } from './implementations/maths/shl.ts';
import { shr, shr_signed } from './implementations/maths/shr.ts';
import { bitwise_not } from './implementations/maths/bitwiseNot.ts';
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
// import endent from 'endent';
import { glob } from 'https://deno.land/std@0.170.0/path/glob.ts';
import { parseMultipleRawCairoFunctions } from '../utils/cairoParsing.ts';

const warplibFunctions: WarplibFunctionInfo[] = [
  div_signed(),
  div_signed_unsafe(),
  exp(),
  exp_signed(),
  exp_unsafe(),
  exp_signed_unsafe(),
  negate(),
  shl(),
  shr(),
  shr_signed(),
  // bitwise_and - handwritten
  // bitwise_or - handwritten
  bitwise_not(),
  // ---conversions---
  int_conversions(),
];
warplibFunctions.forEach((warpFunc: WarplibFunctionInfo) => generateFile(warpFunc));

const mathsContent: string = glob
  .sync(path.join(PATH_TO_WARPLIB, 'maths', '*.cairo'))
  .map((pathToFile) => {
    const fileName = path.basename(pathToFile, '.cairo');
    const rawCairoCode = new TextDecoder("utf-8").decode(Deno.readFileSync(pathToFile))
    const funcNames = parseMultipleRawCairoFunctions(rawCairoCode).map(({ name }) => name);
    return { fileName, funcNames };
  })
  // TODO: Remove this filter once all warplib modules use cairo1
  .filter(({ funcNames }) => funcNames.length > 0)
  .map(({ fileName, funcNames }) => {
    const useFuncNames = funcNames.map((name) => `use ${fileName}::${name};`).join('\n');
    return `mod ${fileName};\n${useFuncNames}`;
  })
  .join('\n\n');

Deno.writeFileSync(
  path.join(PATH_TO_WARPLIB, 'maths.cairo'),
  new TextEncoder().encode(`
    // AUTO-GENERATED
    ${mathsContent}
  `),
);
