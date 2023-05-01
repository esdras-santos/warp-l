// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { TupleFiller } from './tupleFiller.ts';
import { TupleFlattener } from './tupleFlattener.ts';

export class TupleFixes extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    TupleFlattener.map(ast);
    TupleFiller.map(ast);
    return ast;
  }
}
