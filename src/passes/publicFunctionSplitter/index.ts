// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { PublicFunctionCallModifier } from './publicFunctionCallModifier.ts';
import { ExternalFunctionCreator } from './externalFunctionCreator.ts';
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
;
import { InternalFunctionCallCollector } from './internalFunctionCallCollector.ts';

export class PublicFunctionSplitter extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    const internalFunctionCallSet = new Set<FunctionDefinition>();
    ast.roots.forEach((root) =>
      new InternalFunctionCallCollector(internalFunctionCallSet).dispatchVisit(root, ast),
    );
    const internalToExternalFunctionMap = new Map<FunctionDefinition, FunctionDefinition>();
    ast.roots.forEach((root) =>
      new ExternalFunctionCreator(
        internalToExternalFunctionMap,
        internalFunctionCallSet,
      ).dispatchVisit(root, ast),
    );
    ast.roots.forEach((root) =>
      new PublicFunctionCallModifier(internalToExternalFunctionMap).dispatchVisit(root, ast),
    );
    return ast;
  }
}
