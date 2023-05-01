// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation } from '../utils.ts';

export class EventDefinitionWriter extends CairoASTNodeWriter {
  writeInner(node: EventDefinition, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    const args: string = writer.write(node.vParameters);
    return [[documentation, `// #[event]`, `// fn ${node.name}(${args}) {}`].join('\n')];
  }
}
