// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';
;
import { CairoAssert } from '../../ast/cairoNodes/export.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class CairoAssertWriter extends CairoASTNodeWriter {
  writeInner(node: CairoAssert, writer: ASTWriter): SrcDesc {
    const expression = writer.write(node.vExpression);
    const message = node.assertMessage ?? 'Assertion error';
    return [`assert(${expression}, '${message}')`];
  }
}
