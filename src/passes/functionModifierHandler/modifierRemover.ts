// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { printNode } from '../../utils/astPrinter.ts';

/*  Once functions with modifiers are processed, the code of each modifier invoked
    has been inlined in its corresponding function; modifiers are not used anywhere 
    else. Therefore, ModifierDefinition nodes are removed in order to simplify 
    further passes on the ast, as they are no longer needed.
*/
export class ModifierRemover extends ASTMapper {
  visitModifierDefinition(node: ModifierDefinition, _ast: AST) {
    const parent = node.getClosestParentByType(ContractDefinition);
    assert(parent !== undefined, `Unable to find parent of ${printNode(node)}`);
    parent.removeChild(node);
  }
}
