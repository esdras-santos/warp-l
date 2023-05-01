// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';
;

import {
  createCairoGeneratedFunction,
  createCallToFunction,
} from '../../../utils/functionGeneration.ts';
import {
  CairoType,
  generateCallDataDynArrayStructName,
  TypeConversionContext,
} from '../../../utils/cairoTypeSystem.ts';
import { GeneratedFunctionInfo, StringIndexedFuncGen } from '../../base.ts';
import { createIdentifier } from '../../../utils/nodeTemplates.ts';
import { FunctionStubKind } from '../../../ast/cairoNodes/export.ts';
import { typeNameFromTypeNode } from '../../../utils/utils.ts';
import { printTypeNode } from '../../../utils/astPrinter.ts';
import {
  getElementType,
  isDynamicArray,
  safeGetNodeTypeInCtx,
} from '../../../utils/nodeTypeProcessing.ts';

const INDENT = ' '.repeat(4);

export class ExternalDynArrayStructConstructor extends StringIndexedFuncGen {
  public gen(astNode: VariableDeclaration, nodeInSourceUnit?: ASTNode): FunctionCall;
  public gen(astNode: Expression, nodeInSourceUnit?: ASTNode): void;
  public gen(
    astNode: VariableDeclaration | Expression,
    nodeInSourceUnit?: ASTNode,
  ): FunctionCall | undefined {
    const type = generalizeType(
      safeGetNodeTypeInCtx(astNode, this.ast.inference, nodeInSourceUnit ?? astNode),
    )[0];
    assert(
      isDynamicArray(type),
      `Attempted to create dynArray struct for non-dynarray type ${printTypeNode(type)}`,
    );

    const funcDef = this.getOrCreateFuncDef(type);
    if (astNode instanceof VariableDeclaration) {
      const functionInputs: Identifier[] = [
        createIdentifier(astNode, this.ast, DataLocation.CallData, nodeInSourceUnit ?? astNode),
      ];
      return createCallToFunction(funcDef, functionInputs, this.ast);
    } else {
      // When CallData DynArrays are being returned and we do not need the StructConstructor
      // to be returned, we just need the StructDefinition to be in the contract.
      return;
    }
  }

  public getOrCreateFuncDef(type: ArrayType | BytesType | StringType) {
    const elemType = getElementType(type);

    const key = elemType.pp();
    const value = this.generatedFunctionsDef.get(key);
    if (value !== undefined) {
      return value;
    }

    const funcInfo = this.getOrCreate(elemType);
    const funcDef = createCairoGeneratedFunction(
      funcInfo,
      [['darray', typeNameFromTypeNode(type, this.ast), DataLocation.CallData]],
      [['darray_struct', typeNameFromTypeNode(type, this.ast), DataLocation.CallData]],
      this.ast,
      this.sourceUnit,
      {
        mutability: FunctionStateMutability.View,
        stubKind: FunctionStubKind.StructDefStub,
        acceptsRawDArray: true,
      },
    );
    this.generatedFunctionsDef.set(key, funcDef);
    return funcDef;
  }

  private getOrCreate(elemType: TypeNode): GeneratedFunctionInfo {
    const elementCairoType = CairoType.fromSol(
      elemType,
      this.ast,
      TypeConversionContext.CallDataRef,
    );
    const structName = generateCallDataDynArrayStructName(elemType, this.ast);
    const funcInfo: GeneratedFunctionInfo = {
      name: structName,
      code: [
        `struct ${structName}{`,
        `${INDENT} len : felt ,`,
        `${INDENT} ptr : ${elementCairoType.toString()}*,`,
        `}`,
      ].join('\n'),
      functionsCalled: [],
    };
    return funcInfo;
  }
}
