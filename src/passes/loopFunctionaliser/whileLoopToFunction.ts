// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { collectUnboundVariables, createOuterCall } from '../../utils/functionGeneration.ts';
import { createLoopCall, extractDoWhileToFunction, extractWhileToFunction } from './utils.ts';

export class WhileLoopToFunction extends ASTMapper {
  constructor(
    private loopToContinueFunction: Map<number, FunctionDefinition>,
    private loopFnCounter: { count: number },
  ) {
    super();
  }

  loopToFunction(node: WhileStatement | DoWhileStatement, ast: AST): void {
    // Visit innermost loops first
    this.commonVisit(node, ast);
    const loopExtractionFn =
      node instanceof DoWhileStatement ? extractDoWhileToFunction : extractWhileToFunction;

    const unboundVariables = new Map(
      [...collectUnboundVariables(node).entries()].filter(([decl]) => !decl.stateVariable),
    );

    const functionDef = loopExtractionFn(
      node,
      [...unboundVariables.keys()],
      this.loopToContinueFunction,
      ast,
      this.loopFnCounter.count++,
    );

    const outerCall = createOuterCall(
      node,
      [...unboundVariables.keys()],
      createLoopCall(functionDef, [...unboundVariables.keys()], ast),
      ast,
    );
    ast.replaceNode(node, outerCall);
  }

  visitWhileStatement(node: WhileStatement, ast: AST): void {
    this.loopToFunction(node, ast);
  }

  visitDoWhileStatement(node: DoWhileStatement, ast: AST): void {
    this.loopToFunction(node, ast);
  }
}
