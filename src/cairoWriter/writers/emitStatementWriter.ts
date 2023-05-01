// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';

export class EmitStatementWriter extends CairoASTNodeWriter {
  writeInner(node: EmitStatement, writer: ASTWriter): SrcDesc {
    const eventDef = node.vEventCall.vReferencedDeclaration;
    assert(eventDef instanceof EventDefinition, `Expected EventDefinition as referenced type`);

    const documentation = getDocumentation(node.documentation, writer);
    const args: string = node.vEventCall.vArguments.map((v) => writer.write(v)).join(', ');
    return [[documentation, `${eventDef.name}.emit(${args});`].join('\n')];
  }
}
