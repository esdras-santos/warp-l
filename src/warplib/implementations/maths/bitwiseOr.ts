// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../../ast/ast.ts';
import { IntxIntFunction } from '../../utils.ts';

export function functionaliseBitwiseOr(node: BinaryOperation, ast: AST): void {
  IntxIntFunction(node, 'bitwise_or', 'only256', false, false, ast);
}
