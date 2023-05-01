// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { getDefaultValue } from '../utils/defaultValueNodes.ts';
import { TranspileFailedError } from '../utils/errors.ts';
import { safeGetNodeType } from '../utils/nodeTypeProcessing.ts';

export class VariableDeclarationInitialiser extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  visitVariableDeclarationStatement(node: VariableDeclarationStatement, ast: AST): void {
    if (node.vInitialValue) return;

    // We assume the declaration list is only one long in the case it hasn't been initialised.
    // Tuple declarations must be initialised and the rhs cannot contain empty slots
    if (node.vDeclarations.length > 1) {
      throw new TranspileFailedError("Can't instantiate multiple arguments");
    }
    const declaration = node.vDeclarations[0];
    if (!declaration.vType) {
      // This could be transpile failed because a previous pass didn't specify a type,
      throw new TranspileFailedError('Please specify all types');
    }

    node.vInitialValue = getDefaultValue(
      safeGetNodeType(declaration, ast.inference),
      declaration,
      ast,
    );
    ast.registerChild(node.vInitialValue, node);
  }
}
