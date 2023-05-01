// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';
export const cyan = chalk.cyan.bold;
export const error = chalk.red.bold;
export const warning = chalk.yellow.bold;
import * as pathLib from 'https://deno.land/std@0.185.0/path/mod.ts';

export function underline(text: string): string {
  return `${text}\n${'-'.repeat(text.length)}`;
}

export function removeExcessNewlines(text: string, maxAllowed: number): string {
  while (text.includes(`\n`.repeat(maxAllowed + 1))) {
    text = text.replace('\n'.repeat(maxAllowed + 1), `\n`.repeat(maxAllowed));
  }
  return text;
}

export function formatPath(path: string): string {
  assert(path.length > 0, 'Attempted to format empty import path');
  const base = path.endsWith('.sol') ? path.slice(0, -'.sol'.length) : path;
  return base.replaceAll(pathLib.sep, '.');
}
