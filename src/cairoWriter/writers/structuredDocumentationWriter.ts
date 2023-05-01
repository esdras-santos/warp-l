// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';

export class StructuredDocumentationWriter extends CairoASTNodeWriter {
  writeInner(node: StructuredDocumentation, _writer: ASTWriter): SrcDesc {
    return [`// ${node.text.split('\n').join('\n//')}`];
  }
}
