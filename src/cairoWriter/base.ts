// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../ast/ast.ts';
;
import { NotSupportedYetError } from '../utils/errors.ts';

export abstract class CairoASTNodeWriter extends ASTNodeWriter {
  ast: AST;
  throwOnUnimplemented: boolean;
  constructor(ast: AST, throwOnUnimplemented: boolean) {
    super();
    this.ast = ast;
    this.throwOnUnimplemented = throwOnUnimplemented;
  }

  logNotImplemented(message: string) {
    if (this.throwOnUnimplemented) {
      throw new NotSupportedYetError(message);
    } else {
      console.log(message);
    }
  }
}
