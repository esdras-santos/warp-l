// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { cloneASTNode } from '../utils/cloning.ts';
import { getDefaultValue } from '../utils/defaultValueNodes.ts';
import { collectUnboundVariables } from '../utils/functionGeneration.ts';
import { safeGetNodeType } from '../utils/nodeTypeProcessing.ts';

export class ReturnVariableInitializer extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  visitFunctionDefinition(node: FunctionDefinition, ast: AST): void {
    this.commonVisit(node, ast);
    const body = node.vBody;
    if (body === undefined) return;

    [...collectUnboundVariables(body).entries()]
      .filter(([decl]) => node.vReturnParameters.vParameters.includes(decl))
      .forEach(([decl, identifiers]) => {
        const newDecl = cloneASTNode(decl, ast);
        const newDeclStatement = new VariableDeclarationStatement(
          ast.reserveId(),
          '',
          [newDecl.id],
          [newDecl],
          getDefaultValue(safeGetNodeType(decl, ast.inference), newDecl, ast),
        );
        identifiers.forEach((identifier) => {
          identifier.referencedDeclaration = newDecl.id;
        });
        body.insertAtBeginning(newDeclStatement);
        ast.registerChild(newDeclStatement, body);
      });
  }
}
