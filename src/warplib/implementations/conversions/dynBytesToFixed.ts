// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../../ast/ast.ts';
import { createCallToFunction, ParameterInfo } from '../../../utils/functionGeneration.ts';
import { WARPLIB_MEMORY } from '../../../utils/importPaths.ts';
import {
  createBytesTypeName,
  createNumberLiteral,
  createUint8TypeName,
} from '../../../utils/nodeTemplates.ts';
import { typeNameFromTypeNode } from '../../../utils/utils.ts';

export function functionaliseBytesToFixedBytes(
  node: FunctionCall,
  targetType: FixedBytesType,
  ast: AST,
): void {
  const wide = targetType.size === 32;
  const funcName = wide ? 'wm_bytes_to_fixed32' : 'wm_bytes_to_fixed';
  const args: ParameterInfo[] = wide
    ? [['bytesLoc', createBytesTypeName(ast), DataLocation.Memory]]
    : [
        ['bytesLoc', createBytesTypeName(ast), DataLocation.Memory],
        ['width', createUint8TypeName(ast)],
      ];

  const importedFunc = ast.registerImport(node, WARPLIB_MEMORY, funcName, args, [
    ['res', typeNameFromTypeNode(targetType, ast)],
  ]);

  const replacement = createCallToFunction(
    importedFunc,
    wide
      ? node.vArguments
      : [...node.vArguments, createNumberLiteral(targetType.size, ast, 'uint8')],
    ast,
  );
  ast.replaceNode(node, replacement);
}
