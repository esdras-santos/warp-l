// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { DynArrayModifier } from './dynamicArrayModifier.ts';
import { RefTypeModifier } from './memoryRefInputModifier.ts';

export class ExternalArgModifier extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    ast = RefTypeModifier.map(ast);
    ast = DynArrayModifier.map(ast);
    return ast;
  }
}
