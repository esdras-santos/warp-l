// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Implicits } from '../utils/utils.ts';
import { parseMultipleRawCairoFunctions } from '../utils/cairoParsing.ts';
import { glob } from 'https://deno.land/std@0.170.0/path/glob.ts';
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';

export const warplibImportInfo = glob
  .sync('warplib/src/**/*.cairo')
  .reduce((warplibMap, pathToFile) => {
    const rawCairoCode = new TextDecoder("utf-8").decode(Deno.readFileSync(pathToFile))

    // TODO: Add encodePath here. Importing encodePath cause circular
    // dependency error. Suggested solution is to relocate the import files
    const importPath = [
      'warplib',
      ...pathToFile.slice('warplib/src/'.length, -'.cairo'.length).split(path.sep),
    ].join('/');

    const fileMap: Map<string, Implicits[]> =
      warplibMap.get(importPath) ?? new Map<string, Implicits[]>();

    if (!warplibMap.has(importPath)) {
      warplibMap.set(importPath, fileMap);
    }

    parseMultipleRawCairoFunctions(rawCairoCode).forEach((cairoFunc) =>
      fileMap.set(cairoFunc.name, cairoFunc.implicits),
    );

    return warplibMap;
  }, new Map<string, Map<string, Implicits[]>>());
