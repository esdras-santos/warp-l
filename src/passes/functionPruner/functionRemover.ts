// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import assert from 'assert';

;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { printNode } from '../../utils/astPrinter.ts';
import { isExternallyVisible } from '../../utils/utils.ts';

export class FunctionRemover extends ASTMapper {
  private functionGraph: Map<number, FunctionDefinition[]>;
  private reachableFunctions: Set<number>;

  constructor(graph: Map<number, FunctionDefinition[]>) {
    super();
    this.functionGraph = graph;
    this.reachableFunctions = new Set();
  }

  visitSourceUnit(node: SourceUnit, ast: AST): void {
    node.vFunctions.filter((func) => isExternallyVisible(func)).forEach((func) => this.dfs(func));

    node.vContracts.forEach((c) => this.visitContractDefinition(c, ast));

    node.vFunctions
      .filter((func) => !this.reachableFunctions.has(func.id))
      .forEach((func) => node.removeChild(func));
  }

  visitContractDefinition(node: ContractDefinition, _ast: AST) {
    // Collect visible functions and obtain ids of all reachable functions
    node.vFunctions.filter((func) => isExternallyVisible(func)).forEach((func) => this.dfs(func));

    // Remove unreachable functions
    node.vFunctions
      .filter((func) => !this.reachableFunctions.has(func.id))
      .forEach((func) => node.removeChild(func));
  }

  dfs(f: FunctionDefinition): void {
    this.reachableFunctions.add(f.id);

    const functions = this.functionGraph.get(f.id);
    assert(functions !== undefined, `Function ${printNode(f)} was not added to the functionGraph`);
    functions.forEach((f) => {
      if (!this.reachableFunctions.has(f.id)) this.dfs(f);
    });
  }
}
