// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';
import { getErrorMessage, WillNotSupportError } from '../utils/errors.ts';
import { MANGLED_WARP } from '../utils/nameModifiers.ts';

export class RejectPrefix extends ASTMapper {
  forbiddenPrefix = [MANGLED_WARP];
  rejectedNames: [string, ASTNode][] = [];

  checkNoPrefixMatch(name: string, node: ASTNode) {
    this.forbiddenPrefix.forEach((prefix) => {
      if (name.startsWith(prefix))
        this.rejectedNames.push([
          `Names starting with ${prefix} are not allowed in the code`,
          node,
        ]);
    });
  }

  static map(ast: AST): AST {
    const rejectedPerSource: Map<string, [string, ASTNode][]> = new Map();
    ast.roots.forEach((sourceUnit) => {
      const mapper = new this();
      mapper.dispatchVisit(sourceUnit, ast);
      if (mapper.rejectedNames.length > 0)
        rejectedPerSource.set(sourceUnit.absolutePath, mapper.rejectedNames);
    });

    if (rejectedPerSource.size > 0)
      throw new WillNotSupportError(
        getErrorMessage(rejectedPerSource, `Identifiers with not allowed prefixes were detected:`),
        undefined,
        false,
      );

    return ast;
  }

  visitStructDefinition(node: StructDefinition, ast: AST) {
    this.checkNoPrefixMatch(node.name, node);
    this.commonVisit(node, ast);
  }
  visitVariableDeclaration(node: VariableDeclaration, ast: AST) {
    this.checkNoPrefixMatch(node.name, node);
    this.commonVisit(node, ast);
  }
  visitFunctionDefinition(node: FunctionDefinition, ast: AST) {
    this.checkNoPrefixMatch(node.name, node);
    this.commonVisit(node, ast);
  }
  visitContractDefinition(node: ContractDefinition, ast: AST) {
    this.checkNoPrefixMatch(node.name, node);
    this.commonVisit(node, ast);
  }
  visitEventDefinition(node: EventDefinition, ast: AST) {
    this.checkNoPrefixMatch(node.name, node);
    this.commonVisit(node, ast);
  }
}
