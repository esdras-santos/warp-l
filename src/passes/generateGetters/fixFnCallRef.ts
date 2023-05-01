// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';

;

import { TranspileFailedError } from '../../utils/errors.ts';

export class FixFnCallRef extends ASTMapper {
  constructor(private getterFunctions: Map<VariableDeclaration, FunctionDefinition>) {
    super();
  }

  visitFunctionCall(node: FunctionCall, ast: AST): void {
    if (node.vReferencedDeclaration instanceof VariableDeclaration) {
      if (
        node.vReferencedDeclaration.stateVariable &&
        node.vReferencedDeclaration.visibility === 'public'
      ) {
        /*
          Getter function of a public state variable can be 
          only invoked through using this.`functionName` only
        */
        if (!(node.vExpression instanceof MemberAccess)) {
          throw new TranspileFailedError('FixFnCallRef: vExpression is not a MemberAccess');
        }

        //assert getterFunctions has this variable
        const getterFunction = this.getterFunctions.get(node.vReferencedDeclaration);
        if (!getterFunction) {
          throw new TranspileFailedError(
            `FixFnCallRef: getter function for a public state variable not found`,
          );
        }

        node.vExpression.vReferencedDeclaration = getterFunction;
      }
    }
    return this.visitExpression(node, ast);
  }
}
