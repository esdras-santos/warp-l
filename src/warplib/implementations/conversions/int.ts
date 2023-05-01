// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

;
import { AST } from '../../../ast/ast.ts';
import { printNode, printTypeNode } from '../../../utils/astPrinter.ts';
import { safeGetNodeType } from '../../../utils/nodeTypeProcessing.ts';
import {
  bound,
  forAllWidths,
  IntFunction,
  mask,
  msb,
  uint256,
  WarplibFunctionInfo,
} from '../../utils.ts';
import assert from "../../../utils/assertFunc.ts";

export function int_conversions(): WarplibFunctionInfo {
  return {
    fileName: 'int_conversions',
    imports: [
      'from starkware.cairo.common.bitwise import bitwise_and',
      'from starkware.cairo.common.cairo_builtins import BitwiseBuiltin',
      'from starkware.cairo.common.math import split_felt',
      'from starkware.cairo.common.uint256 import Uint256, uint256_add',
    ],
    functions: [
      ...forAllWidths((from) => {
        const x = forAllWidths((to) => {
          if (from < to) {
            if (to === 256) {
              return [
                `func warp_int${from}_to_int256{range_check_ptr, bitwise_ptr: BitwiseBuiltin*}(op : felt) -> (res : Uint256){`,
                `    let (msb) = bitwise_and(op, ${msb(from)});`,
                `    let (high, low) = split_felt(op);`,
                `    let naiveExtension = Uint256(low, high);`,
                `    if (msb == 0){`,
                `        return (naiveExtension,);`,
                `    }else{`,
                `        let (res, _) = uint256_add(naiveExtension, ${uint256(
                  sign_extend_value(from, to),
                )});`,
                `        return (res,);`,
                `    }`,
                '}',
              ];
            } else {
              return [
                `func warp_int${from}_to_int${to}{bitwise_ptr: BitwiseBuiltin*}(op : felt) -> (res : felt){`,
                `    let (msb) = bitwise_and(op, ${msb(from)});`,
                `    if (msb == 0){`,
                `        return (op,);`,
                `    }else{`,
                `        return (op + 0x${sign_extend_value(from, to).toString(16)},);`,
                `    }`,
                '}',
              ];
            }
          } else if (from === to) {
            return [];
          } else {
            if (from === 256) {
              if (to > 128) {
                return [
                  `func warp_int${from}_to_int${to}{bitwise_ptr: BitwiseBuiltin*}(op : Uint256) -> (res : felt){`,
                  `    let (high) = bitwise_and(op.high,${mask(to - 128)});`,
                  `    return (op.low + ${bound(128)} * high,);`,
                  `}`,
                ];
              } else {
                return [
                  `func warp_int${from}_to_int${to}{bitwise_ptr: BitwiseBuiltin*}(op : Uint256) -> (res : felt){`,
                  `    let (res) = bitwise_and(op.low, ${mask(to)});`,
                  `    return (res,);`,
                  `}`,
                ];
              }
            } else {
              return [
                `func warp_int${from}_to_int${to}{bitwise_ptr : BitwiseBuiltin*}(op : felt) -> (res : felt){`,
                `    let (res) = bitwise_and(op, ${mask(to)});`,
                `    return (res,);`,
                `}`,
              ];
            }
          }
        });
        return x.map((f) => f.join('\n')).join('\n');
      }),
      [
        'func warp_uint256{range_check_ptr}(op : felt) -> (res : Uint256){',
        '    let split = split_felt(op);',
        '    return (Uint256(low=split.low, high=split.high),);',
        '}',
      ].join('\n'),
    ],
  };
}

function sign_extend_value(from: number, to: number): bigint {
  return 2n ** BigInt(to) - 2n ** BigInt(from);
}

export function functionaliseIntConversion(conversion: FunctionCall, ast: AST): void {
  const arg = conversion.vArguments[0];
  const fromType = generalizeType(safeGetNodeType(arg, ast.inference))[0];
  assert(
    fromType instanceof IntType,
    `Argument of int conversion expected to be int type. Got ${printTypeNode(
      fromType,
    )} at ${printNode(conversion)}`,
  );
  const toType = safeGetNodeType(conversion, ast.inference);
  assert(
    toType instanceof IntType,
    `Int conversion expected to be int type. Got ${printTypeNode(toType)} at ${printNode(
      conversion,
    )}`,
  );

  if ((fromType as IntType).nBits < 256 && (toType as IntType).nBits === 256 && !(fromType as IntType).signed && !(toType as IntType).signed) {
    IntFunction(conversion, conversion.vArguments[0], 'uint', 'int_conversions', ast);
    return;
  } else if (
    (fromType as IntType).nBits === (toType as IntType).nBits ||
    ((fromType as IntType).nBits < (toType as IntType).nBits && !(fromType as IntType).signed && !(toType as IntType).signed)
  ) {
    arg.typeString = conversion.typeString;
    ast.replaceNode(conversion, arg);
    return;
  } else {
    const name = `${(fromType as IntType).pp().startsWith('u') ? (fromType as IntType).pp().slice(1) : (fromType as IntType).pp()}_to_int`;
    IntFunction(conversion, conversion.vArguments[0], name, 'int_conversions', ast);
    return;
  }
}
