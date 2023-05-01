// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoType, TypeConversionContext } from '../../utils/cairoTypeSystem.ts';
import { safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { mangleStructName } from '../../utils/utils.ts';
import { CairoASTNodeWriter } from '../base.ts';
import { INDENT } from '../utils.ts';

export class StructDefinitionWriter extends CairoASTNodeWriter {
  writeInner(node: StructDefinition, _writer: ASTWriter): SrcDesc {
    return [
      [
        `struct ${mangleStructName(node)}{`,
        ...node.vMembers
          .map(
            (value) =>
              `${value.name} : ${CairoType.fromSol(
                safeGetNodeType(value, this.ast.inference),
                this.ast,
                TypeConversionContext.StorageAllocation,
              )},`,
          )
          .map((v) => INDENT + v),
        `}`,
      ].join('\n'),
    ];
  }
}
