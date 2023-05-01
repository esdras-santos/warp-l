// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { isDynamicCallDataArray, safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class IndexAccessWriter extends CairoASTNodeWriter {
  writeInner(node: IndexAccess, writer: ASTWriter): SrcDesc {
    assert(node.vIndexExpression !== undefined);
    const baseWritten = writer.write(node.vBaseExpression);
    const indexWritten = writer.write(node.vIndexExpression);
    if (isDynamicCallDataArray(safeGetNodeType(node.vBaseExpression, this.ast.inference))) {
      return [`${baseWritten}.ptr[${indexWritten}]`];
    }
    return [`${baseWritten}[${indexWritten}]`];
  }
}
