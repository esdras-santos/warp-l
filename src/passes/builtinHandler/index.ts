// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { MathsOperationToFunction } from './mathsOperationToFunction.ts';
import { ExplicitConversionToFunc } from './explicitConversionToFunc.ts';
import { MsgSender } from './msgSender.ts';
import { ThisKeyword } from './thisKeyword.ts';
import { Ecrecover } from './ecrecover.ts';
import { Keccak } from './keccak.ts';
import { BlockMethods } from './blockMethods.ts';

export class BuiltinHandler extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    ast = MsgSender.map(ast);
    ast = BlockMethods.map(ast);
    ast = Ecrecover.map(ast);
    ast = Keccak.map(ast);
    ast = ExplicitConversionToFunc.map(ast);
    ast = MathsOperationToFunction.map(ast);
    ast = ThisKeyword.map(ast);
    return ast;
  }
}
