// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { WARP_KECCAK } from '../../utils/importPaths.ts';
import {
  createArrayTypeName,
  createBytesNTypeName,
  createUintNTypeName,
} from '../../utils/nodeTemplates.ts';

export class Keccak extends ASTMapper {
  visitFunctionCall(node: FunctionCall, ast: AST): void {
    if (
      !(
        node.vFunctionName === 'keccak256' &&
        node.vFunctionCallType === ExternalReferenceType.Builtin
      )
    ) {
      return this.commonVisit(node, ast);
    }

    const warpKeccak = ast.registerImport(
      node,
      ...WARP_KECCAK,
      [['input', createArrayTypeName(createUintNTypeName(8, ast), ast), DataLocation.Memory]],
      [['hash', createBytesNTypeName(32, ast)]],
    );

    ast.replaceNode(node, createCallToFunction(warpKeccak, node.vArguments, ast));

    this.commonVisit(node, ast);
  }
}
