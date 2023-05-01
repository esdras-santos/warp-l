// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { AST } from '../../ast/ast.ts';
import { CairoType, TypeConversionContext } from '../../utils/cairoTypeSystem.ts';
import { createCairoGeneratedFunction, createCallToFunction } from '../../utils/functionGeneration.ts';
import { typeNameFromTypeNode } from '../../utils/utils.ts';
import { GeneratedFunctionInfo, StringIndexedFuncGen } from '../base.ts';
import { MemoryToStorageGen } from '../memory/memoryToStorage.ts';
import { DynArrayGen } from './dynArray.ts';
import { StorageWriteGen } from './storageWrite.ts';
import { StorageToStorageGen } from './copyToStorage.ts';
import { CalldataToStorageGen } from '../calldata/calldataToStorage.ts';
import {
  getElementType,
  isDynamicArray,
  safeGetNodeType,
  specializeType,
} from '../../utils/nodeTypeProcessing.ts';
import { ImplicitArrayConversion } from '../calldata/implicitArrayConversion.ts';
import { U128_FROM_FELT, UINT256_ADD } from '../../utils/importPaths.ts';
// import endent from 'endent';

export class DynArrayPushWithArgGen extends StringIndexedFuncGen {
  public constructor(
    private dynArrayGen: DynArrayGen,
    private storageWrite: StorageWriteGen,
    private memoryToStorage: MemoryToStorageGen,
    private storageToStorage: StorageToStorageGen,
    private calldataToStorage: CalldataToStorageGen,
    private calldataToStorageConversion: ImplicitArrayConversion,
    ast: AST,
    sourceUnit: SourceUnit,
  ) {
    super(ast, sourceUnit);
  }

  public gen(push: FunctionCall): FunctionCall {
    assert(push.vExpression instanceof MemberAccess);
    const arrayType = generalizeType(
      safeGetNodeType(push.vExpression.vExpression, this.ast.inference),
    )[0];
    assert(
      arrayType instanceof ArrayType ||
        arrayType instanceof BytesType ||
        arrayType instanceof StringType,
    );

    assert(
      push.vArguments.length > 0,
      `Attempted to treat push without argument as push with argument`,
    );
    const [argType, argLoc] = generalizeType(
      safeGetNodeType(push.vArguments[0], this.ast.inference),
    );

    const funcDef = this.getOrCreateFuncDef(arrayType, argType, argLoc);
    return createCallToFunction(
      funcDef,
      [push.vExpression.vExpression, push.vArguments[0]],
      this.ast,
    );
  }

  public getOrCreateFuncDef(
    arrayType: TypeNode,
    argType: TypeNode,
    argLoc: DataLocation | undefined,
  ) {
    const key = `dynArrayPushWithArg(${arrayType.pp()},${argType.pp()},${argLoc})`;
    const value = this.generatedFunctionsDef.get(key);
    if (value !== undefined) {
      return value;
    }

    const funcInfo = this.getOrCreate(
      getElementType(arrayType),
      argType,
      argLoc ?? DataLocation.Default,
    );

    const funcDef = createCairoGeneratedFunction(
      funcInfo,
      [
        ['loc', typeNameFromTypeNode(arrayType, this.ast), DataLocation.Storage],
        ['value', typeNameFromTypeNode(argType, this.ast), argLoc ?? DataLocation.Default],
      ],
      [],
      this.ast,
      this.sourceUnit,
    );
    this.generatedFunctionsDef.set(key, funcDef);
    return funcDef;
  }

  private getOrCreate(
    elementType: TypeNode,
    argType: TypeNode,
    argLoc: DataLocation,
  ): GeneratedFunctionInfo {
    let elementWriteDef: FunctionDefinition;
    let inputType: string;
    if (argLoc === DataLocation.Memory) {
      elementWriteDef = this.memoryToStorage.getOrCreateFuncDef(elementType);
      inputType = 'felt';
    } else if (argLoc === DataLocation.Storage) {
      elementWriteDef = this.storageToStorage.getOrCreateFuncDef(elementType, argType);
      inputType = 'felt';
    } else if (argLoc === DataLocation.CallData) {
      if (elementType.pp() !== argType.pp()) {
        elementWriteDef = this.calldataToStorageConversion.getOrCreateFuncDef(
          specializeType(elementType, DataLocation.Storage),
          specializeType(argType, DataLocation.CallData),
        );
      } else {
        elementWriteDef = this.calldataToStorage.getOrCreateFuncDef(elementType, argType);
      }
      inputType = CairoType.fromSol(
        argType,
        this.ast,
        TypeConversionContext.CallDataRef,
      ).toString();
    } else {
      elementWriteDef = this.storageWrite.getOrCreateFuncDef(elementType);
      inputType = CairoType.fromSol(elementType, this.ast).toString();
    }

    const allocationCairoType = CairoType.fromSol(
      elementType,
      this.ast,
      TypeConversionContext.StorageAllocation,
    );
    const [dynArray, dynArrayLength] = this.dynArrayGen.getOrCreateFuncDef(elementType);
    const arrayName = dynArray.name;
    const lengthName = dynArrayLength.name;
    const funcName = `${arrayName}_PUSHV${this.generatedFunctionsDef.size}`;

    const implicit = argLoc === DataLocation.Memory ? '#[implicit(warp_memory)]' : '';

    const callWriteFunc = (cairoVar: string) =>
      isDynamicArray(argType) || argType instanceof MappingType
        ? [`let (elem_id) = readId(${cairoVar});`, `${elementWriteDef.name}(elem_id, value);`]
        : [`${elementWriteDef.name}(${cairoVar}, value);`];

    return {
      name: funcName,
      code: `
        ${implicit}
        func ${funcName}(loc: felt, value: ${inputType}) -> (){
            alloc_locals;
            let (len) = ${lengthName}.read(loc);
            let (newLen, carry) = uint256_add(len, Uint256(1,0));
            assert carry = 0;
            ${lengthName}.write(loc, newLen);
            let (existing) = ${arrayName}.read(loc, len);
            if (existing == 0){
                let (used) = WARP_USED_STORAGE.read();
                WARP_USED_STORAGE.write(used + ${allocationCairoType.width});
                ${arrayName}.write(loc, len, used);
                ${callWriteFunc('used').join('\n')}
            }else{
                ${callWriteFunc('existing').join('\n')}
            }
            return ();
        }
      `,
      functionsCalled: [
        this.requireImport(...U128_FROM_FELT),
        this.requireImport(...UINT256_ADD),
        elementWriteDef,
        dynArray,
        dynArrayLength,
      ],
    };
  }
}
