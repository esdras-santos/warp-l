// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
import {existsSync} from "https://deno.land/std/fs/mod.ts";

export function outputFileSync(file: string, data: string) {
  const dir = path.dirname(file);
  if (existsSync(dir)) {
    return Deno.writeFileSync(file, new TextEncoder().encode(data));
  }
  Deno.mkdirSync(dir, { recursive: true });
  Deno.writeFileSync(file, new TextEncoder().encode(data));
}
