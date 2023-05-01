// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { createIdentifier } from '../../utils/nodeTemplates.ts';

export class StateVarRefFlattener extends ASTMapper {
  visitMemberAccess(node: MemberAccess, ast: AST): void {
    if (
      node.vReferencedDeclaration instanceof VariableDeclaration &&
      node.vReferencedDeclaration.stateVariable
    ) {
      ast.replaceNode(node, createIdentifier(node.vReferencedDeclaration, ast));
      return;
    }

    this.visitExpression(node, ast);
  }
}
