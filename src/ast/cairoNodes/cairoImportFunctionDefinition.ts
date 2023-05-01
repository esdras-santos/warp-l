// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoFunctionDefinition, FunctionStubKind } from './cairoFunctionDefinition.ts';
import { Implicits } from '../../utils/utils.ts';

export class CairoImportFunctionDefinition extends CairoFunctionDefinition {
  path: string[];
  constructor(
    id: number,
    src: string,
    scope: number,
    name: string,
    path: string[],
    implicits: Set<Implicits>,
    parameters: ParameterList,
    returnParameters: ParameterList,
    stubKind: FunctionStubKind,
    acceptsRawDArray = false,
    acceptsUnpackedStructArray = false,
  ) {
    super(
      id,
      src,
      scope,
      FunctionKind.Function,
      name,
      false,
      FunctionVisibility.Internal,
      FunctionStateMutability.NonPayable,
      false,
      parameters,
      returnParameters,
      [],
      implicits,
      stubKind,
      acceptsRawDArray,
      acceptsUnpackedStructArray,
    );
    this.path = path;
  }
}
