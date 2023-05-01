// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoTempVarStatement } from '../../ast/cairoNodes/export.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class CairoTempVarWriter extends CairoASTNodeWriter {
  writeInner(node: CairoTempVarStatement, _writer: ASTWriter): SrcDesc {
    return [`let ${node.name} = ${node.name};`];
  }
}
