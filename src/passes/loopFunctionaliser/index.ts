// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { BreakToReturn } from './breakToReturn.ts';
import { ContinueToLoopCall } from './continueToLoopCall.ts';
import { ForLoopToWhile } from './forLoopToWhile.ts';
import { ReturnToBreak } from './returnToBreak.ts';
import { WhileLoopToFunction } from './whileLoopToFunction.ts';

export class LoopFunctionaliser extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    const loopFnCounter = { count: 0 };

    ast.roots.forEach((root) => {
      const loopToContinueFunction: Map<number, FunctionDefinition> = new Map();

      new ForLoopToWhile().dispatchVisit(root, ast);
      new ReturnToBreak().dispatchVisit(root, ast);
      new WhileLoopToFunction(loopToContinueFunction, loopFnCounter).dispatchVisit(root, ast);
      new BreakToReturn().dispatchVisit(root, ast);
      new ContinueToLoopCall(loopToContinueFunction).dispatchVisit(root, ast);
    });
    return ast;
  }
}
