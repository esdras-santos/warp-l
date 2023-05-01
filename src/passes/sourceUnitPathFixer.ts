// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
import {existsSync} from "https://deno.land/std/fs/mod.ts";
;
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';

export class SourceUnitPathFixer extends ASTMapper {
  constructor(private includePaths: string[]) {
    super();
  }

  visitSourceUnit(node: SourceUnit, _ast: AST): void {
    if (!existsSync(node.absolutePath)) {
      for (const prefix of this.includePaths) {
        const filePath = path.join(prefix, node.absolutePath);
        if (existsSync(filePath)) {
          node.absolutePath = filePath;
          break;
        }
      }
    }
  }

  static map_(ast: AST, includePaths: string[]): AST {
    ast.roots.forEach((root) => {
      const mapper = new this(includePaths);
      mapper.dispatchVisit(root, ast);
    });
    return ast;
  }
}
