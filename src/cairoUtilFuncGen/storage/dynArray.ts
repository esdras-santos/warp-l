// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { CairoType, TypeConversionContext } from '../../utils/cairoTypeSystem.ts';
import { GeneratedFunctionInfo, StringIndexedFuncGen } from '../base.ts';
import { getElementType } from '../../utils/nodeTypeProcessing.ts';
import { createCairoGeneratedFunction, createCallToFunction } from '../../utils/functionGeneration.ts';
import { CairoFunctionDefinition, FunctionStubKind } from '../../ast/cairoNodes/export.ts';
import { createUint256TypeName, createUintNTypeName } from '../../utils/nodeTemplates.ts';

export class DynArrayGen extends StringIndexedFuncGen {
  public genLength(
    node: MemberAccess,
    arrayType: ArrayType | BytesType | StringType,
  ): FunctionCall {
    const [_dynArray, dynArrayLength] = this.getOrCreateFuncDef(getElementType(arrayType));
    return createCallToFunction(dynArrayLength, [node.vExpression], this.ast);
  }

  // TODO: keep using storage vars as functions feels odd now
  public getOrCreateFuncDef(type: TypeNode): [CairoFunctionDefinition, CairoFunctionDefinition] {
    const cairoType = CairoType.fromSol(type, this.ast, TypeConversionContext.StorageAllocation);

    const key = cairoType.fullStringRepresentation;
    const lengthKey = key + '_LENGTH';
    const existing = this.generatedFunctionsDef.get(key);
    if (existing !== undefined) {
      const existingLength = this.generatedFunctionsDef.get(lengthKey);
      assert(existingLength !== undefined);
      return [existing, existingLength];
    }

    const [arrayInfo, lengthInfo] = this.getOrCreate(cairoType);

    const dynArray = createCairoGeneratedFunction(
      arrayInfo,
      [
        ['name', createUintNTypeName(248, this.ast)],
        ['index', createUint256TypeName(this.ast)],
      ],
      [['res_loc', createUintNTypeName(248, this.ast)]],
      this.ast,
      this.sourceUnit,
      {
        mutability: FunctionStateMutability.View,
        stubKind: FunctionStubKind.StorageDefStub,
      },
    );
    const dynArrayLength = createCairoGeneratedFunction(
      lengthInfo,
      [['name', createUintNTypeName(248, this.ast)]],
      [['length', createUint256TypeName(this.ast)]],
      this.ast,
      this.sourceUnit,
      {
        mutability: FunctionStateMutability.View,
        stubKind: FunctionStubKind.StorageDefStub,
      },
    );

    this.generatedFunctionsDef.set(key, dynArray);
    this.generatedFunctionsDef.set(lengthKey, dynArrayLength);
    return [dynArray, dynArrayLength];
  }

  private getOrCreate(valueCairoType: CairoType): [GeneratedFunctionInfo, GeneratedFunctionInfo] {
    const mappingName = `WARP_DARRAY${this.generatedFunctionsDef.size}_${valueCairoType.typeName}`;
    const funcInfo: GeneratedFunctionInfo = {
      name: mappingName,
      code: `${mappingName}: LegacyMap::<(felt252, u256), felt252>`,
      functionsCalled: [],
    };

    const lengthFuncInfo: GeneratedFunctionInfo = {
      name: `${mappingName}_LENGTH`,
      code: `${mappingName}_LENGTH: LegacyMap::<felt252, u256>`,
      functionsCalled: [],
    };
    return [funcInfo, lengthFuncInfo];
  }
}
