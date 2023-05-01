// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;

export class CairoTempVarStatement extends Statement {
  constructor(
    id: number,
    src: string,
    public name: string,
    documentation?: string | StructuredDocumentation,
    raw?: unknown,
  ) {
    super(id, src, documentation, raw);
  }
}
