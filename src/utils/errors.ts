// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import {existsSync} from "https://deno.land/std/fs/mod.ts";
import { error } from './formatting.ts';
import { getSourceFromLocations } from './utils.ts';

export function logError(message: string): void {
  console.error(error(message));
}

export class CLIError extends Error {
  constructor(message: string) {
    super(error(message));
  }
}

export class InsaneASTError extends Error {}

export class TranspilationAbandonedError extends Error {
  constructor(message: string, node?: ASTNode, highlight = true) {
    message = highlight ? `${error(message)}${`\n\n${getSourceCode(node)}\n`}` : message;
    super(message);
  }
}

function getSourceCode(node: ASTNode | undefined): string {
  if (node === undefined) return '';
  const sourceUnit = node.getClosestParentByType(SourceUnit);
  if (sourceUnit === undefined) return '';
  const filePath = sourceUnit.absolutePath;
  if (existsSync(filePath)) {
    const content = new TextDecoder("utf-8").decode(Deno.readFileSync(filePath))
    return [
      `File ${filePath}:\n`,
      ...getSourceFromLocations(content, [parseSourceLocation(node.src)], error, 3)
        .split('\n')
        .map((l) => `\t${l}`),
    ].join('\n');
  } else {
    return '';
  }
}

// For features that will not be supported unless Cairo changes to make implementing them feasible
export class WillNotSupportError extends TranspilationAbandonedError {}
export class NotSupportedYetError extends TranspilationAbandonedError {}
export class TranspileFailedError extends TranspilationAbandonedError {}
export class PassOrderError extends TranspilationAbandonedError {}

export function getErrorMessage(
  unsupportedPerSource: Map<string, [string, ASTNode][]>,
  initialMessage: string,
): string {
  let errorNum = 0;
  const errorMsg = [...unsupportedPerSource.entries()].reduce(
    (fullMsg, [filePath, unsupported]) => {
      const content = new TextDecoder("utf-8").decode(Deno.readFileSync(filePath))
      const newMessage = unsupported.reduce((newMessage, [errorMsg, node]) => {
        const errorCode = getSourceFromLocations(
          content,
          [parseSourceLocation(node.src)],
          error,
          4,
        );
        errorNum += 1;
        return newMessage + `\n${error(`${errorNum}. ` + errorMsg)}:\n\n${errorCode}\n`;
      }, `\nFile ${filePath}:\n`);

      return fullMsg + newMessage;
    },
    error(initialMessage + '\n'),
  );
  return errorMsg;
}

export interface ExecSyncError {
  // So far this is the only property from the execSync Error that is used
  // if some other is needed then just add it here
  stderr: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOfExecSyncError(object: any): object is ExecSyncError {
  return 'stderr' in object;
}
