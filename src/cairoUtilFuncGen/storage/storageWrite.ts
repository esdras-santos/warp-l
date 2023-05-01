// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import endent from 'endent';
;
import {
  CairoBool,
  CairoType,
  CairoUint,
  CairoUint256,
  TypeConversionContext,
} from '../../utils/cairoTypeSystem.ts';
import { cloneASTNode } from '../../utils/cloning.ts';
import { createCairoGeneratedFunction, createCallToFunction } from '../../utils/functionGeneration.ts';
import { BOOL_INTO_FELT252, U128_TO_FELT } from '../../utils/importPaths.ts';
import { safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { typeNameFromTypeNode } from '../../utils/utils.ts';
import { add, GeneratedFunctionInfo, StringIndexedFuncGen } from '../base.ts';
import { toFeltfromuXImport } from '../utils/uNselector.ts';

export class StorageWriteGen extends StringIndexedFuncGen {
  public gen(storageLocation: Expression, writeValue: Expression): FunctionCall {
    const typeToWrite = safeGetNodeType(storageLocation, this.ast.inference);
    const funcDef = this.getOrCreateFuncDef(typeToWrite);
    return createCallToFunction(funcDef, [storageLocation, writeValue], this.ast);
  }

  public getOrCreateFuncDef(typeToWrite: TypeNode) {
    const key = typeToWrite.pp();
    const value = this.generatedFunctionsDef.get(key);
    if (value !== undefined) {
      return value;
    }

    const funcInfo = this.getOrCreate(typeToWrite);
    const argTypeName = typeNameFromTypeNode(typeToWrite, this.ast);
    const funcDef = createCairoGeneratedFunction(
      funcInfo,
      [
        ['loc', argTypeName, DataLocation.Storage],
        [
          'value',
          cloneASTNode(argTypeName, this.ast),
          typeToWrite instanceof PointerType ? DataLocation.Storage : DataLocation.Default,
        ],
      ],
      [
        [
          'res',
          cloneASTNode(argTypeName, this.ast),
          typeToWrite instanceof PointerType ? DataLocation.Storage : DataLocation.Default,
        ],
      ],
      this.ast,
      this.sourceUnit,
    );
    this.generatedFunctionsDef.set(key, funcDef);
    return funcDef;
  }

  private getOrCreate(typeToWrite: TypeNode): GeneratedFunctionInfo {
    const functionsCalled: FunctionDefinition[] = [];
    const cairoTypeToWrite = CairoType.fromSol(
      typeToWrite,
      this.ast,
      TypeConversionContext.StorageAllocation,
    );
    const cairoTypeString = cairoTypeToWrite.toString();
    const writeCode = cairoTypeToWrite
      .serialiseMembers('value')
      .map((name, index) => {
        if (cairoTypeToWrite instanceof CairoBool) {
          functionsCalled.push(this.requireImport(...BOOL_INTO_FELT252));
          return `
            let intEncoded${index} = bool_into_felt252(${name});
            ${write(add('loc', index), `intEncoded${index}`)}
          `;
        }
        if (cairoTypeToWrite.fullStringRepresentation === CairoUint256.fullStringRepresentation) {
          functionsCalled.push(this.requireImport(...U128_TO_FELT));
          name = `u128_to_felt252(${name})`;
        } else if (cairoTypeToWrite instanceof CairoUint) {
          name = `${cairoTypeString}_to_felt252(${name})`;
          functionsCalled.push(this.requireImport(...toFeltfromuXImport(cairoTypeToWrite)));
        }
        return `  ${write(add('loc', index), name)}`;
      })
      .join('\n');

    const funcName = `WS${this.generatedFunctionsDef.size}_WRITE_${cairoTypeToWrite.typeName}`;
    const funcInfo: GeneratedFunctionInfo = {
      name: funcName,
      code: `
        fn ${funcName}(loc: felt252, value: ${cairoTypeString}) -> ${cairoTypeString}{
          ${writeCode}
          return value;
        }
      `,
      functionsCalled: functionsCalled,
    };
    return funcInfo;
  }
}

function write(offset: string, value: string): string {
  return `WARP_STORAGE::write(${offset}, ${value});`;
}
