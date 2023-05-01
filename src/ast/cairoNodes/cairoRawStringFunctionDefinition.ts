// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoFunctionDefinition, FunctionStubKind } from './cairoFunctionDefinition.ts';
import { getRawCairoFunctionInfo } from '../../utils/cairoParsing.ts';

export class CairoRawStringFunctionDefinition extends CairoFunctionDefinition {
  rawStringDefinition: string;
  constructor(
    id: number,
    src: string,
    scope: number,
    kind: FunctionKind,
    name: string,
    visibility: FunctionVisibility,
    stateMutability: FunctionStateMutability,
    parameters: ParameterList,
    returnParameters: ParameterList,
    functionSutbKind: FunctionStubKind,
    rawStringDefinition: string,
    acceptsRawDArray = false,
    acceptsUnpackedStructArray = false,
  ) {
    super(
      id,
      src,
      scope,
      kind,
      name,
      false, // Virtual
      visibility,
      stateMutability,
      false, // IsConstructor
      parameters,
      returnParameters,
      [], // Modifier Invocation
      functionSutbKind === FunctionStubKind.FunctionDefStub
        ? new Set(getRawCairoFunctionInfo(rawStringDefinition).implicits)
        : new Set(),
      functionSutbKind,
      acceptsRawDArray,
      acceptsUnpackedStructArray,
    );
    this.rawStringDefinition = rawStringDefinition;
  }
}
