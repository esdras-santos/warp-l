// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { NotSupportedYetError } from '../utils/errors.ts';
import {
  getContractTypeString,
  getEnumTypeString,
  getFunctionTypeString,
  getStructTypeString,
} from '../utils/getTypeString.ts';

// The pass handles specific imports for library, contract, interface,
// free functions, structs and enum.
//
// Working :
// For each identifier node of ImportDirective the pass adds typeString
// of referencedDeclaration Node. (The identifier nodes of ImportDirective
// do not have default typeString (current latest solc version - 0.8.13).

export class ImportDirectiveIdentifier extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  visitImportDirective(node: ImportDirective, ast: AST): void {
    node.getChildrenByType(Identifier).forEach((identifier) => {
      assert(identifier.vReferencedDeclaration !== undefined);
      identifier.typeString = getTypestring(identifier.vReferencedDeclaration, ast);
    });
  }
}

function getTypestring(node: ASTNode, ast: AST): string {
  if (node instanceof ContractDefinition) {
    return getContractTypeString(node);
  }

  if (node instanceof FunctionDefinition) {
    return getFunctionTypeString(node, ast.inference);
  }

  if (node instanceof StructDefinition) {
    return getStructTypeString(node);
  }

  if (node instanceof EnumDefinition) {
    return getEnumTypeString(node);
  }

  throw new NotSupportedYetError(`Importing ${node.type} not implemented yet`);
}
