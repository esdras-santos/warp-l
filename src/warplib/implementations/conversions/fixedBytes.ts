// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck


;
import { AST } from '../../../ast/ast.ts';
import { printTypeNode, printNode } from '../../../utils/astPrinter.ts';
import { createCallToFunction } from '../../../utils/functionGeneration.ts';
import { BYTES_CONVERSIONS } from '../../../utils/importPaths.ts';
import { createNumberLiteral, createUint8TypeName } from '../../../utils/nodeTemplates.ts';
import { safeGetNodeType } from '../../../utils/nodeTypeProcessing.ts';
import { typeNameFromTypeNode } from '../../../utils/utils.ts';
import assert from "../../../utils/assertFunc.ts";

export function functionaliseFixedBytesConversion(conversion: FunctionCall, ast: AST): void {
  const arg = conversion.vArguments[0];
  const fromType = generalizeType(safeGetNodeType(arg, ast.inference))[0];
  assert(
    fromType instanceof FixedBytesType,
    `Argument of fixed bytes conversion expected to be fixed bytes type. Got ${printTypeNode(
      fromType,
    )} at ${printNode(conversion)}`,
  );
  const toType = safeGetNodeType(conversion, ast.inference);
  assert(
    toType instanceof FixedBytesType,
    `Fixed bytes conversion expected to be fixed bytes type. Got ${printTypeNode(
      toType,
    )} at ${printNode(conversion)}`,
  );

  if ((fromType as FixedBytesType).size < (toType as FixedBytesType).size) {
    const fullName = `warp_bytes_widen${(toType as FixedBytesType).size === 32 ? '_256' : ''}`;
    const importedFunc = ast.registerImport(
      conversion,
      BYTES_CONVERSIONS,
      fullName,
      [
        ['op', typeNameFromTypeNode(fromType, ast)],
        ['widthDiff', createUint8TypeName(ast)],
      ],
      [['res', typeNameFromTypeNode(toType, ast)]],
    );

    const call = createCallToFunction(
      importedFunc,
      [arg, createNumberLiteral(8 * ((toType as FixedBytesType).size - (fromType as FixedBytesType).size), ast, 'uint8')],
      ast,
    );

    ast.replaceNode(conversion, call);
    return;
  } else if ((fromType as FixedBytesType).size === (toType as FixedBytesType).size) {
    ast.replaceNode(conversion, arg);
    return;
  } else {
    const fullName = `warp_bytes_narrow${(fromType as FixedBytesType).size === 32 ? '_256' : ''}`;
    const importedFunc = ast.registerImport(
      conversion,
      BYTES_CONVERSIONS,
      fullName,
      [
        ['op', typeNameFromTypeNode(fromType, ast)],
        ['widthDiff', createUint8TypeName(ast)],
      ],
      [['res', typeNameFromTypeNode(toType, ast)]],
    );

    const call = createCallToFunction(
      importedFunc,
      [arg, createNumberLiteral(8 * ((fromType as FixedBytesType).size - (toType as FixedBytesType).size), ast, 'uint8')],
      ast,
    );

    ast.replaceNode(conversion, call);
    return;
  }
}
