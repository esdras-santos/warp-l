// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { CairoContract } from '../../ast/cairoNodes/export.ts';
import { cloneASTNode } from '../../utils/cloning.ts';
import { fixSuperReference, getBaseContracts } from './utils.ts';

export function addNonOverriddenModifiers(
  node: CairoContract,
  idRemapping: Map<number, ModifierDefinition>,
  idRemappingOverriders: Map<number, ModifierDefinition>,
  ast: AST,
) {
  const currentModifiers: Map<string, ModifierDefinition> = new Map();

  node.vModifiers.forEach((modifier) => currentModifiers.set(modifier.name, modifier));

  getBaseContracts(node)
    .filter((node) => node.kind !== ContractKind.Library)
    .forEach((contract) => {
      contract.vModifiers.forEach((modifier, depth) => {
        const existingModifier = currentModifiers.get(modifier.name);
        const clonedModifier = cloneASTNode(modifier, ast);
        idRemapping.set(modifier.id, clonedModifier);
        if (existingModifier === undefined) {
          currentModifiers.set(modifier.name, clonedModifier);
          idRemappingOverriders.set(modifier.id, clonedModifier);
        } else {
          clonedModifier.name = `m${depth + 1}_${clonedModifier.name}`;
          idRemappingOverriders.set(modifier.id, existingModifier);
        }
        node.appendChild(clonedModifier);
        fixSuperReference(clonedModifier, contract, node);
      });
    });
}
