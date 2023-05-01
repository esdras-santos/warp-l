// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { createReturn } from '../../utils/nodeTemplates.ts';
import { getContainingFunction } from '../../utils/utils.ts';

export class BreakToReturn extends ASTMapper {
  visitBreak(node: Break, ast: AST): void {
    const containingFunction = getContainingFunction(node);

    ast.replaceNode(
      node,
      createReturn(
        containingFunction.vParameters.vParameters,
        containingFunction.vReturnParameters.id,
        ast,
      ),
    );
  }
}
