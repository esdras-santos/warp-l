// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { GET_CALLER_ADDRESS } from '../../utils/importPaths.ts';
import { createAddressTypeName } from '../../utils/nodeTemplates.ts';

export class MsgSender extends ASTMapper {
  visitMemberAccess(node: MemberAccess, ast: AST): void {
    if (
      node.vExpression instanceof Identifier &&
      node.vExpression.name === 'msg' &&
      node.vExpression.vIdentifierType === ExternalReferenceType.Builtin &&
      node.memberName === 'sender'
    ) {
      const replacementCall = createCallToFunction(
        ast.registerImport(
          node,
          ...GET_CALLER_ADDRESS,
          [],
          [['address', createAddressTypeName(false, ast)]],
        ),
        [],
        ast,
      );
      ast.replaceNode(node, replacementCall);
    }
    // Fine to recurse because there is a check that the member access is a Builtin. Therefor a.msg.sender should
    // not be picked up.
    this.visitExpression(node, ast);
  }
}
