// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;

export class ModuleType extends TypeNode {
  readonly path: string;

  constructor(path: string, src?: Range) {
    super(src);

    this.path = path;
  }

  pp(): string {
    return `module "${this.path}"`;
  }
}
