// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';
import { notUndefined } from '../../utils/typeConstructs.ts';

export class IfStatementWriter extends CairoASTNodeWriter {
  writeInner(node: IfStatement, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    return [
      [
        documentation,
        `if ${writer.write(node.vCondition)} {`,
        writer.write(node.vTrueBody),
        ...(node.vFalseBody ? ['} else {', writer.write(node.vFalseBody)] : []),
        '}',
      ]
        .filter(notUndefined)
        .flat()
        .join('\n'),
    ];
  }
}
