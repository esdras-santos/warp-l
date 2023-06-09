// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { cloneASTNode } from '../../utils/cloning.ts';
import { createBlock, createBoolLiteral } from '../../utils/nodeTemplates.ts';

export class ForLoopToWhile extends ASTMapper {
  visitForStatement(node: ForStatement, ast: AST): void {
    this.commonVisit(node, ast);

    const innerLoopStatements = node.vLoopExpression
      ? [node.vBody, node.vLoopExpression]
      : [node.vBody];

    // Handle the case where the loop condition is undefined in for statement
    // e.g. for (uint k = 0; ; k++)
    const loopCondition = node.vCondition ? node.vCondition : createBoolLiteral(true, ast);

    const replacementWhile = new WhileStatement(
      ast.reserveId(),
      node.src,
      loopCondition,
      createBlock(innerLoopStatements, ast),
    );

    const replacementId = ast.replaceNode(
      node,
      createBlock([replacementWhile], ast, node.documentation),
    );

    if (node.vInitializationExpression !== undefined) {
      if (node.vInitializationExpression instanceof VariableDeclarationStatement) {
        node.vInitializationExpression.vDeclarations.forEach(
          (decl) => (decl.scope = replacementId),
        );
      }
      ast.insertStatementBefore(replacementWhile, node.vInitializationExpression);
    }
  }

  visitContinue(node: Continue, ast: AST): void {
    const currentLoop = node.getClosestParentBySelector(
      (n) =>
        n instanceof ForStatement || n instanceof WhileStatement || n instanceof DoWhileStatement,
    );
    if (currentLoop instanceof ForStatement && currentLoop.vLoopExpression) {
      ast.insertStatementBefore(node, cloneASTNode(currentLoop.vLoopExpression, ast));
    }
  }
}
