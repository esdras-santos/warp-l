// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';

export class ElementaryTypeNameExpressionWriter extends CairoASTNodeWriter {
  writeInner(_node: ElementaryTypeNameExpression, _writer: ASTWriter): SrcDesc {
    // ElementaryTypeNameExpressions left in the tree by this point
    // are unreferenced expressions, and that this needs to work without
    // ineffectual statement handling
    return ['0'];
  }
}
