// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { printNode } from '../../utils/astPrinter.ts';
import { CairoType } from '../../utils/cairoTypeSystem.ts';
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { WM_INDEX_STATIC } from '../../utils/importPaths.ts';
import { createNumberLiteral, createUint256TypeName } from '../../utils/nodeTemplates.ts';
import { typeNameFromTypeNode } from '../../utils/utils.ts';
import { CairoUtilFuncGenBase } from '../base.ts';

/*
  Produces function stubs for index accesses into statically sized memory arrays
  The actual implementation of this is written in warplib, but for consistency with other
  such cases, this is implemented as a CairoUtilFuncGenBase that produces no code
  The associated warplib function takes the width of the datatype and the length of the array
  as parameters to avoid bloating the code with separate functions for each case
*/
export class MemoryStaticArrayIndexAccessGen extends CairoUtilFuncGenBase {
  gen(indexAccess: IndexAccess, arrayType: ArrayType): FunctionCall {
    assert(
      arrayType.size !== undefined,
      `Attempted to use static indexing for dynamic index ${printNode(indexAccess)}`,
    );
    assert(
      indexAccess.vIndexExpression,
      `Found index access without index expression at ${printNode(indexAccess)}`,
    );

    const importFunc = this.requireImport(
      ...WM_INDEX_STATIC,
      [
        ['arr', typeNameFromTypeNode(arrayType, this.ast), DataLocation.Memory],
        ['index', createUint256TypeName(this.ast)],
        ['width', createUint256TypeName(this.ast)],
        ['length', createUint256TypeName(this.ast)],
      ],
      [['child', typeNameFromTypeNode(arrayType.elementT, this.ast), DataLocation.Memory]],
    );
    const width = CairoType.fromSol(arrayType.elementT, this.ast).width;
    return createCallToFunction(
      importFunc,
      [
        indexAccess.vBaseExpression,
        indexAccess.vIndexExpression,
        createNumberLiteral(width, this.ast, 'uint256'),
        createNumberLiteral(arrayType.size, this.ast, 'uint256'),
      ],
      this.ast,
    );
  }
}
