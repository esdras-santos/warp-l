// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { CairoFunctionDefinition } from '../../ast/cairoNodes/export.ts';
import { createCairoGeneratedFunction, createCallToFunction } from '../../utils/functionGeneration.ts';
import { createBytesTypeName } from '../../utils/nodeTemplates.ts';
import { isValueType, safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { typeNameFromTypeNode } from '../../utils/utils.ts';
import { GeneratedFunctionInfo, StringIndexedFuncGenWithAuxiliar } from '../base.ts';

export abstract class AbiBase extends StringIndexedFuncGenWithAuxiliar {
  protected functionName = 'not_implemented';

  public gen(expressions: Expression[]): FunctionCall {
    const exprTypes = expressions.map(
      (expr) => generalizeType(safeGetNodeType(expr, this.ast.inference))[0],
    );

    const generatedFunction = this.getOrCreateFuncDef(exprTypes);

    return createCallToFunction(generatedFunction, expressions, this.ast);
  }

  public getOrCreateFuncDef(types: TypeNode[]): CairoFunctionDefinition {
    const key = types.map((t) => t.pp()).join(',');
    const existing = this.generatedFunctionsDef.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const genFuncInfo = this.getOrCreate(types);
    const functionStub = createCairoGeneratedFunction(
      genFuncInfo,
      types.map((exprT, index) =>
        isValueType(exprT)
          ? [`param${index}`, typeNameFromTypeNode(exprT, this.ast)]
          : [`param${index}`, typeNameFromTypeNode(exprT, this.ast), DataLocation.Memory],
      ),
      [['result', createBytesTypeName(this.ast), DataLocation.Memory]],
      this.ast,
      this.sourceUnit,
    );

    this.generatedFunctionsDef.set(key, functionStub);
    return functionStub;
  }

  public getOrCreate(_types: TypeNode[]): GeneratedFunctionInfo {
    throw new Error('Method not implemented.');
  }

  public getOrCreateEncoding(_type: TypeNode): CairoFunctionDefinition {
    throw new Error('Method not implemented.');
  }
}

/**
 * Returns a static array type string without the element
 * information
 * e.g.
 *    uint8[20] -> uint8[]
 *    uint[][8] -> uint[][]
 *    uint[10][15] -> uint[10][]
 *  @param type a static ArrayType
 *  @returns static array without length information
 */
export function removeSizeInfo(type: ArrayType): string {
  assert(type.size !== undefined, 'Expected an ArrayType with known size (a solc static array)');
  const typeString = type
    .pp()
    .split(/(\[[0-9]*\])/)
    .filter((s) => s !== '');
  return [...typeString.slice(0, typeString.length - 1), '[]'].join('');
}
