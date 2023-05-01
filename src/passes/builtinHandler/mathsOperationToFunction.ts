// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { NotSupportedYetError } from '../../utils/errors.ts';
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { WARPLIB_MATHS } from '../../utils/importPaths.ts';
import { createNumberLiteral, createUint256TypeName } from '../../utils/nodeTemplates.ts';
import { functionaliseBitwiseAnd } from '../../warplib/implementations/maths/bitwiseAnd.ts';
import { functionaliseBitwiseNot } from '../../warplib/implementations/maths/bitwiseNot.ts';
import { functionaliseBitwiseOr } from '../../warplib/implementations/maths/bitwiseOr.ts';
import { functionaliseExp } from '../../warplib/implementations/maths/exp.ts';
import { functionaliseNegate } from '../../warplib/implementations/maths/negate.ts';
import { functionaliseShl } from '../../warplib/implementations/maths/shl.ts';
import { functionaliseShr } from '../../warplib/implementations/maths/shr.ts';
import { functionaliseXor } from '../../warplib/implementations/maths/xor.ts';
import { functionaliseUncheckedSub, functionaliseUncheckedAdd } from './utils/uncheckedMathUtils.ts';

/* Note we also include mulmod and add mod here */
export class MathsOperationToFunction extends ASTMapper {
  inUncheckedBlock = false;

  visitUncheckedBlock(node: UncheckedBlock, ast: AST): void {
    this.inUncheckedBlock = true;
    this.commonVisit(node, ast);
    this.inUncheckedBlock = false;
  }

  visitBinaryOperation(node: BinaryOperation, ast: AST): void {
    this.commonVisit(node, ast);
    const isUnchecked = this.inUncheckedBlock;
    if (
      !((isUnchecked && (node.operator === '-' || node.operator === '+')) || node.operator === '**')
    ) {
      return;
    }
    /* eslint-disable @typescript-eslint/no-empty-function */
    // TODO: Let's disable for now this lint report in the file. The other functions should be reviewed when
    // we do the bijection between Cairo1(uN) and Solidity(uintN). After that, the logic can be changed.
    const operatorMap: Map<string, () => void> = new Map([
      // Arith
      ['+', () => functionaliseUncheckedAdd(node, ast)],
      ['-', () => functionaliseUncheckedSub(node, ast)],
      ['**', () => functionaliseExp(node, this.inUncheckedBlock, ast)],
      // Bitwise
      ['&', () => functionaliseBitwiseAnd(node, ast)],
      ['|', () => functionaliseBitwiseOr(node, ast)],
      ['^', () => functionaliseXor(node, ast)],
      ['<<', () => functionaliseShl(node, ast)],
      ['>>', () => functionaliseShr(node, ast)],
    ]);

    const thunk = operatorMap.get(node.operator);
    if (thunk === undefined) {
      throw new NotSupportedYetError(`${node.operator} not supported yet`);
    }

    thunk();
  }

  visitUnaryOperation(node: UnaryOperation, ast: AST): void {
    this.commonVisit(node, ast);
    const operatorMap: Map<string, () => void> = new Map([
      ['-', () => functionaliseNegate(node, ast)],
      ['~', () => functionaliseBitwiseNot(node, ast)],
      ['!', () => replaceNot(node, ast)],
      [
        'delete',
        () => {
          return;
        },
      ],
    ]);

    const thunk = operatorMap.get(node.operator);
    if (thunk === undefined) {
      throw new NotSupportedYetError(`${node.operator} not supported yet`);
    }

    thunk();
  }

  visitFunctionCall(node: FunctionCall, ast: AST): void {
    this.commonVisit(node, ast);

    if (
      node.vExpression instanceof Identifier &&
      node.vExpression.vReferencedDeclaration === undefined
    ) {
      if (['mulmod', 'addmod'].includes(node.vExpression.name)) {
        const name = `warp_${node.vExpression.name}`;
        const importedFunc = ast.registerImport(
          node,
          [...WARPLIB_MATHS, node.vExpression.name],
          name,
          [
            ['x', createUint256TypeName(ast)],
            ['y', createUint256TypeName(ast)],
          ],
          [['res', createUint256TypeName(ast)]],
        );
        const replacement = createCallToFunction(importedFunc, node.vArguments, ast);
        ast.replaceNode(node, replacement);
      }
    }
  }
}

function replaceNot(node: UnaryOperation, ast: AST): void {
  ast.replaceNode(
    node,
    new BinaryOperation(
      ast.reserveId(),
      node.src,
      node.typeString,
      '-',
      createNumberLiteral(1, ast, node.typeString),
      node.vSubExpression,
      node.raw,
    ),
  );
}
