// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../../ast/ast.ts';
;
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { createUint256TypeName } from '../../utils/nodeTemplates.ts';
import { typeNameFromTypeNode } from '../../utils/utils.ts';
import { safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { CairoUtilFuncGenBase } from '../base.ts';
import { WM_DYN_ARRAY_LENGTH } from '../../utils/importPaths.ts';

export class MemoryDynArrayLengthGen extends CairoUtilFuncGenBase {
  gen(node: MemberAccess, ast: AST): FunctionCall {
    const arrayType = generalizeType(safeGetNodeType(node.vExpression, ast.inference))[0];
    const arrayTypeName = typeNameFromTypeNode(arrayType, ast);
    const funcDef = this.requireImport(
      ...WM_DYN_ARRAY_LENGTH,
      [['arrayLoc', arrayTypeName, DataLocation.Memory]],
      [['len', createUint256TypeName(this.ast)]],
    );
    return createCallToFunction(funcDef, [node.vExpression], this.ast);
  }
}
