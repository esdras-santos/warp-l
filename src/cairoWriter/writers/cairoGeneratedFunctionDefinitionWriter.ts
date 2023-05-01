// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoGeneratedFunctionDefinition } from '../../ast/cairoNodes/cairoGeneratedFunctionDefinition.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class CairoGeneratedFunctionDefinitionWriter extends CairoASTNodeWriter {
  writeInner(node: CairoGeneratedFunctionDefinition, _writer: ASTWriter): SrcDesc {
    return [node.rawStringDefinition];
  }
}
