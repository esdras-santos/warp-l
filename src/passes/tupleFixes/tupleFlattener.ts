// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { WillNotSupportError } from '../../utils/errors.ts';

export class TupleFlattener extends ASTMapper {
  visitTupleExpression(node: TupleExpression, ast: AST): void {
    if (
      node.parent instanceof TupleExpression &&
      node.parent.isInlineArray === false &&
      node.isInlineArray === false
    ) {
      throw new WillNotSupportError('Nested Tuple References not Supported');
    }
    if (
      node.vOriginalComponents.length === 1 &&
      node.vOriginalComponents[0] !== null &&
      node.vOriginalComponents[0].typeString === node.typeString &&
      !node.isInlineArray
    ) {
      const parent = node.parent;
      ast.replaceNode(node, node.vOriginalComponents[0], parent);
      this.dispatchVisit(node.vOriginalComponents[0], ast);
    } else {
      this.visitExpression(node, ast);
    }
  }
}
