// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';
import { isCairoConstant } from '../../utils/utils.ts';

export class VariableDeclarationWriter extends CairoASTNodeWriter {
  writeInner(node: VariableDeclaration, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    if ((node.stateVariable || node.parent instanceof SourceUnit) && isCairoConstant(node)) {
      assert(node.vValue !== undefined, 'Constant should have a defined value.');
      const constantValue = writer.write(node.vValue);
      return [[documentation, `const ${node.name} = ${constantValue};`].join('\n')];
    }

    return [node.name];
  }
}
