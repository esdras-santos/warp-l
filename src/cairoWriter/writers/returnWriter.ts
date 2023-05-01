// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';

export class ReturnWriter extends CairoASTNodeWriter {
  writeInner(node: Return, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    const returns = node.vExpression ? writer.write(node.vExpression) : '()';

    return [[documentation, `return ${returns};`].join('\n')];
  }
}
