// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { TranspileFailedError } from '../../utils/errors.ts';
import { primitiveTypeToCairo, isCairoPrimitiveIntType, divmod } from '../../utils/utils.ts';
import { CairoASTNodeWriter } from '../base.ts';
import { CairoUint256 } from '../../utils/cairoTypeSystem.ts';

export class LiteralWriter extends CairoASTNodeWriter {
  writeInner(node: Literal, _: ASTWriter): SrcDesc {
    const type = primitiveTypeToCairo(node.typeString);
    switch (node.kind) {
      case LiteralKind.Number:
        if (isCairoPrimitiveIntType(type)) {
          if (type === CairoUint256.toString()) {
            const [high, low] = divmod(BigInt(node.value), BigInt(Math.pow(2, 128)));
            return [`u256_from_felts( ${low}, ${high} )`];
          }
          return [`${node.value}_${type}`];
        } else if (type === 'ContractAddress') {
          return [`starknet::contract_address_const::<${node.value}>()`];
        } else if (type === 'felt') {
          return [node.value];
        } else {
          throw new TranspileFailedError(`Attempted to write unexpected cairo type: ${type}`);
        }

      case LiteralKind.Bool:
        return [node.value];
      case LiteralKind.String:
      case LiteralKind.UnicodeString: {
        if (
          node.value.length === node.hexValue.length / 2 &&
          node.value.length < 32 &&
          node.value.split('').every((v) => v.charCodeAt(0) < 127)
        ) {
          return [`'${node.value}'`];
        }
        return [`0x${node.hexValue}`];
      }
      case LiteralKind.HexString:
        if (isCairoPrimitiveIntType(type)) {
          if (type === CairoUint256.toString()) {
            return [
              `u256_from_felts( ${node.hexValue.slice(32, 64)}, ${node.hexValue.slice(0, 32)} )`,
            ];
          }
          return [`0x${node.hexValue}_${type}`];
        } else if (type === 'ContractAddress') {
          return [`starknet::contract_address_const::<${node.hexValue}>()`];
        } else if (type === 'felt') {
          return [`0x${node.hexValue}`];
        } else {
          throw new TranspileFailedError('Attempted to write unexpected cairo type');
        }
    }
  }
}
