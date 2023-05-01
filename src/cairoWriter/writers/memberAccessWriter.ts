// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';

export class MemberAccessWriter extends CairoASTNodeWriter {
  writeInner(node: MemberAccess, writer: ASTWriter): SrcDesc {
    if (this.ast.inference.typeOf(node.vExpression) instanceof TypeNameType) {
      return [`${writer.write(node.vExpression)}::${node.memberName}`];
    } else {
      return [`${writer.write(node.vExpression)}.${node.memberName}`];
    }
  }
}
