// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as mod from "https://deno.land/std@0.110.0/node/os.ts";
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';

import { NotSupportedYetError } from './utils/errors.ts';

type SupportedPlatforms = 'linux_x64' | 'darwin_x64' | 'darwin_arm64';
export type SupportedSolcVersions = '7' | '8';

export function getPlatform(): SupportedPlatforms {

  const platform = `${mod.platform()}_${mod.arch()}`;

  switch (platform) {
    case 'linux_x64':
    case 'darwin_x64':
    case 'darwin_arm64':
      return platform;
    default:
      throw new NotSupportedYetError(`Unsupported plaform ${platform}`);
  }
}

export function nethersolcPath(version: SupportedSolcVersions): string {
  const platform = getPlatform();
  return path.resolve('..', 'nethersolc', platform, version, 'solc');
}

export function fullVersionFromMajor(majorVersion: SupportedSolcVersions): string {
  switch (majorVersion) {
    case '7':
      return '0.7.6';
    case '8':
      return '0.8.14';
  }
}
