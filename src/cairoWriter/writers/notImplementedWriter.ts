// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { printNode } from '../../utils/astPrinter.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class NotImplementedWriter extends CairoASTNodeWriter {
  writeInner(node: ASTNode, _: ASTWriter): SrcDesc {
    this.logNotImplemented(
      `${node.type} to cairo not implemented yet (found at ${printNode(node)})`,
    );
    return [``];
  }
}
