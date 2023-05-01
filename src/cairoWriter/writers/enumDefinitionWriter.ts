// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';

export class EnumDefinitionWriter extends CairoASTNodeWriter {
  writeInner(_node: EnumDefinition, _writer: ASTWriter): SrcDesc {
    // EnumDefinition nodes do not need to be printed because they
    // would have already been replaced by integer literals
    return [``];
  }
}
