// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ASTMapper } from '../../ast/mapper.ts';
import { DeclarationNameMangler } from './declarationNameMangler.ts';
import { AST } from '../../ast/ast.ts';
import { ExpressionNameMangler } from './expressionNameMangler.ts';
export class IdentifierMangler extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    ast = DeclarationNameMangler.map(ast);
    ast = ExpressionNameMangler.map(ast);
    return ast;
  }
}
