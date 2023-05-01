// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { CairoASTNodeWriter } from '../base.ts';

export class AssignmentWriter extends CairoASTNodeWriter {
  writeInner(node: Assignment, writer: ASTWriter): SrcDesc {
    assert(node.operator === '=', `Unexpected operator ${node.operator}`);
    const [lhs, rhs] = [node.vLeftHandSide, node.vRightHandSide];
    const nodes = [lhs, rhs].map((v) => writer.write(v));
    return [`let ${nodes[0]} ${node.operator} ${nodes[1]};`];
  }
}
