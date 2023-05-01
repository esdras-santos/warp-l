// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { ReferenceSubPass } from './referenceSubPass.ts';
import { AST } from '../../ast/ast.ts';
import { printNode } from '../../utils/astPrinter.ts';
import { CairoType, TypeConversionContext } from '../../utils/cairoTypeSystem.ts';
import { NotSupportedYetError } from '../../utils/errors.ts';
import { createCallToFunction } from '../../utils/functionGeneration.ts';
import { createNumberLiteral, createUint256TypeName } from '../../utils/nodeTemplates.ts';
import { getElementType, safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { WM_NEW } from '../../utils/importPaths.ts';

/*
  Handles expressions that directly insert data into memory: struct constructors, news, and inline arrays
  Requires expected data location analysis to determine whether to insert objects into memory
  For memory objects, functions are generated that return a felt associated with the start of the data
*/
export class MemoryAllocations extends ReferenceSubPass {
  visitFunctionCall(node: FunctionCall, ast: AST): void {
    this.visitExpression(node, ast);

    const [actualLoc, expectedLoc] = this.getLocations(node);

    if (
      node.kind === FunctionCallKind.StructConstructorCall &&
      this.expectedDataLocations.get(node) === DataLocation.Memory
    ) {
      const replacement = ast.getUtilFuncGen(node).memory.struct.gen(node);
      this.replace(node, replacement, undefined, actualLoc, expectedLoc, ast);
    } else if (node.vExpression instanceof NewExpression) {
      if (actualLoc === DataLocation.Memory) {
        this.allocateMemoryDynArray(node, ast);
      } else {
        throw new NotSupportedYetError(
          `Allocating dynamic ${
            actualLoc ?? 'unknown-location'
          } arrays not implemented yet (${printNode(node)})`,
        );
      }
    } else if (node.kind === FunctionCallKind.TypeConversion) {
      const type = generalizeType(safeGetNodeType(node, ast.inference))[0];
      const arg = node.vArguments[0];
      if ((type instanceof BytesType || type instanceof StringType) && arg instanceof Literal) {
        const replacement = ast.getUtilFuncGen(node).memory.arrayLiteral.stringGen(arg);
        this.replace(node, replacement, node.parent, actualLoc, expectedLoc, ast);
      }
    }
  }

  visitTupleExpression(node: TupleExpression, ast: AST): void {
    this.visitExpression(node, ast);

    const [actualLoc, expectedLoc] = this.getLocations(node);

    if (!node.isInlineArray) return;

    const replacement = ast.getUtilFuncGen(node).memory.arrayLiteral.tupleGen(node);
    this.replace(node, replacement, undefined, actualLoc, expectedLoc, ast);
  }

  allocateMemoryDynArray(node: FunctionCall, ast: AST): void {
    assert(node.vExpression instanceof NewExpression);

    assert(
      node.vArguments.length === 1,
      `Expected new expression ${printNode(node)} to have one argument, has ${
        node.vArguments.length
      }`,
    );

    const funcImport = ast.registerImport(
      node,
      ...WM_NEW,
      [
        ['len', createUint256TypeName(ast)],
        ['elemWidth', createUint256TypeName(ast)],
      ],
      [['loc', node.vExpression.vTypeName, DataLocation.Memory]],
    );

    const arrayType = generalizeType(safeGetNodeType(node, ast.inference))[0];
    assert(
      arrayType instanceof ArrayType ||
        arrayType instanceof BytesType ||
        arrayType instanceof StringType,
    );

    const elementCairoType = CairoType.fromSol(
      getElementType(arrayType),
      ast,
      TypeConversionContext.Ref,
    );

    const call = createCallToFunction(
      funcImport,
      [node.vArguments[0], createNumberLiteral(elementCairoType.width, ast, 'uint256')],
      ast,
    );

    const [actualLoc, expectedLoc] = this.getLocations(node);
    this.replace(node, call, undefined, actualLoc, expectedLoc, ast);
  }
}
