// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoASTNodeWriter } from '../base.ts';
import { getDocumentation, INDENT } from '../utils.ts';

export class BlockWriter extends CairoASTNodeWriter {
  writeInner(node: Block | UncheckedBlock, writer: ASTWriter): SrcDesc {
    const documentation = getDocumentation(node.documentation, writer);
    return [
      [
        documentation,
        node.vStatements
          .map((value) => writer.write(value))
          .map((v) =>
            v
              .split('\n')
              .map((line) => INDENT + line)
              .join('\n'),
          )
          .join('\n'),
      ].join('\n'),
    ];
  }
}
