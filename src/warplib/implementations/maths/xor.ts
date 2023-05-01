// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../../ast/ast.ts';
import { IntxIntFunction } from '../../utils.ts';

export function functionaliseXor(node: BinaryOperation, ast: AST): void {
  IntxIntFunction(node, 'xor', 'only256', false, false, ast);
}
