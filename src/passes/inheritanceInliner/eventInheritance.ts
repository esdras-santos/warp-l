// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { CairoContract } from '../../ast/cairoNodes/export.ts';
import { cloneASTNode } from '../../utils/cloning.ts';
import { getBaseContracts } from './utils.ts';

export function addEventDefinition(
  node: CairoContract,
  idRemapping: Map<number, EventDefinition>,
  ast: AST,
): void {
  getBaseContracts(node).forEach((base) =>
    base.vEvents.forEach((event) => {
      const newEvent = cloneASTNode(event, ast);
      node.insertAtBeginning(newEvent);
      idRemapping.set(event.id, newEvent);
    }),
  );
}
