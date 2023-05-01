// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoImportFunctionDefinition } from '../../ast/cairoNodes/export.ts';
import { CairoASTNodeWriter } from '../base.ts';

// Not being used as for now
export class CairoImportFunctionDefinitionWriter extends CairoASTNodeWriter {
  writeInner(node: CairoImportFunctionDefinition, _writer: ASTWriter): SrcDesc {
    return [`use ${[...node.path, node.name].join('::')};`];
  }
}
