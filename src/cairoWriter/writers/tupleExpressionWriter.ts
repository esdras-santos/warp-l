// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';

export class TupleExpressionWriter extends CairoASTNodeWriter {
  writeInner(node: TupleExpression, writer: ASTWriter): SrcDesc {
    return [`(${node.vComponents.map((value) => writer.write(value)).join(', ')})`];
  }
}
