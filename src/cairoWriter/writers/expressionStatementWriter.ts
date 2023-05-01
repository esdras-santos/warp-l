// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoAssert } from '../../ast/cairoNodes/export.ts';
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';

export class ExpressionStatementWriter extends CairoASTNodeWriter {
  newVarCounter = 0;
  writeInner(node: ExpressionStatement, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    if (
      (node.vExpression instanceof FunctionCall &&
        node.vExpression.kind !== FunctionCallKind.StructConstructorCall) ||
      node.vExpression instanceof Assignment ||
      node.vExpression instanceof CairoAssert
    ) {
      return [[documentation, `${writer.write(node.vExpression)};`].join('\n')];
    } else {
      return [
        [
          documentation,
          `let __warp_uv${this.newVarCounter++} = ${writer.write(node.vExpression)};`,
        ].join('\n'),
      ];
    }
  }
}
