// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { cloneASTNode } from '../utils/cloning.ts';
import { safeGetNodeType } from '../utils/nodeTypeProcessing.ts';
import { insertConversionIfNecessary } from './implicitConversionToExplicit.ts';

export class ConstantHandler extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  isConstant(node: VariableDeclaration): boolean {
    return (
      node.mutability === Mutability.Constant &&
      (node.vValue instanceof Literal || node.vValue instanceof MemberAccess)
    );
  }

  inlineConstant(node: Identifier | MemberAccess, ast: AST): void {
    const referencedDeclaration = node.vReferencedDeclaration;
    if (
      !(
        referencedDeclaration instanceof VariableDeclaration &&
        referencedDeclaration.vValue &&
        this.isConstant(referencedDeclaration)
      )
    ) {
      return;
    }

    const constant = cloneASTNode(referencedDeclaration.vValue, ast);
    const typeTo = safeGetNodeType(node, ast.inference);

    ast.replaceNode(node, constant);
    insertConversionIfNecessary(constant, typeTo, constant, ast);
  }

  visitIdentifier(node: Identifier, ast: AST): void {
    this.inlineConstant(node, ast);
  }

  visitMemberAccess(node: MemberAccess, ast: AST): void {
    this.inlineConstant(node, ast);
  }
}
