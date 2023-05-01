// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { FunctionStubKind } from './cairoFunctionDefinition.ts';
import { CairoRawStringFunctionDefinition } from './cairoRawStringFunctionDefinition.ts';

export class CairoBlockFunctionDefinition extends CairoRawStringFunctionDefinition {
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
    rawStringDefinition: string,
  ) {
    super(
      id,
      src,
      scope,
      kind,
      name,
      visibility,
      stateMutability,
      parameters,
      returnParameters,
      FunctionStubKind.FunctionDefStub,
      rawStringDefinition,
    );
  }
}
