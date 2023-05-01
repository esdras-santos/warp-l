// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { TEMP_INTERFACE_SUFFIX } from '../utils/nameModifiers.ts';

export class DropUnusedSourceUnits extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    // Drop all source units which don't contain a deployable contract.
    ast.roots = ast.roots.filter(
      (su) =>
        su.vContracts.length > 0 &&
        su.vContracts.some(
          (cd) =>
            (cd.kind === ContractKind.Contract && !cd.abstract) ||
            (cd.kind === ContractKind.Interface && !cd.name.endsWith(TEMP_INTERFACE_SUFFIX)),
        ),
    );
    return ast;
  }
}
