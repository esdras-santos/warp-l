// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { printNode } from '../../utils/astPrinter.ts';
import { createReturn } from '../../utils/nodeTemplates.ts';
import { getContainingFunction } from '../../utils/utils.ts';
import { createLoopCall } from './utils.ts';

export class ContinueToLoopCall extends ASTMapper {
  constructor(private loopToContinueFunction: Map<number, FunctionDefinition>) {
    super();
  }

  visitContinue(node: Continue, ast: AST): void {
    const containingFunction = getContainingFunction(node);

    const continueFunction = this.loopToContinueFunction.get(containingFunction.id);
    assert(
      continueFunction instanceof FunctionDefinition,
      `Unable to find continue function for ${printNode(containingFunction)}`,
    );

    ast.replaceNode(
      node,
      createReturn(
        createLoopCall(continueFunction, containingFunction.vParameters.vParameters, ast),
        containingFunction.vReturnParameters.id,
        ast,
      ),
    );
  }
}
