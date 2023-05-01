// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { ActualLocationAnalyser } from './actualLocationAnalyser.ts';
import { ArrayFunctions } from './arrayFunctions.ts';
import { DataAccessFunctionaliser } from './dataAccessFunctionaliser.ts';
import { StorageDelete } from './delete.ts';
import { ExpectedLocationAnalyser } from './expectedLocationAnalyser.ts';
import { ExternalReturnReceiver } from './externalReturnReceiver.ts';
import { MemoryAllocations } from './memoryAllocations.ts';
import { StateVarRefFlattener } from './stateVarRefFlattener.ts';
import { StoredPointerDereference } from './storedPointerDereference.ts';

/*
  Solidity allows mutable references pointing to mutable data, and while cairo allows reference
  rebinding and pointers, they are not sufficient to for a naive transpilation. Instead, we utilise
  storage_vars for storage and a DictAccess for memory. Both contain data serialised into felts

  First we need to work out what data location each expression refers to. This is usually simple, but
  there are enough edge cases that it's worth separating 

  Second, expressions that actually allocate data into memory are transformed into functions that modify
  the DictAccess and return the index of the start of the allocated data

  Third, array members push, pop, and length are transformed. Those calculable at compile time are replaced
  with literals, others become functions related to the respective data location

  Fourth, deletes referring to storage are replaced with functions that actually modify storage. For other
  data locations the normal way works fine, only for storage does delete actually change the underlying data

  Finally, variables referencing storage or memory are replaced with read or write functions as appropriate
*/

export class References extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  static map(ast: AST): AST {
    ast.roots.forEach((root) => {
      const actualDataLocations: Map<Expression, DataLocation> = new Map();
      const expectedDataLocations: Map<Expression, DataLocation> = new Map();

      new StateVarRefFlattener().dispatchVisit(root, ast);
      new ExternalReturnReceiver().dispatchVisit(root, ast);
      new ActualLocationAnalyser(actualDataLocations).dispatchVisit(root, ast);
      new ExpectedLocationAnalyser(actualDataLocations, expectedDataLocations).dispatchVisit(
        root,
        ast,
      );
      new ArrayFunctions(actualDataLocations, expectedDataLocations).dispatchVisit(root, ast);
      new MemoryAllocations(actualDataLocations, expectedDataLocations).dispatchVisit(root, ast);
      new StorageDelete(actualDataLocations, expectedDataLocations).dispatchVisit(root, ast);
      new StoredPointerDereference(actualDataLocations, expectedDataLocations).dispatchVisit(
        root,
        ast,
      );
      new DataAccessFunctionaliser(actualDataLocations, expectedDataLocations).dispatchVisit(
        root,
        ast,
      );
    });
    return ast;
  }
}

// import { printNode } from '../../utils/astPrinter';
// function printLocations(
//   actualDataLocations: Map<Expression, DataLocation>,
//   expectedDataLocations: Map<Expression, DataLocation>,
// ): void {
//   [...actualDataLocations.entries()].forEach(([expr, loc]) => {
//     console.log(
//       `${printNode(expr)}: actual - ${loc}, expected - ${expectedDataLocations.get(expr)}`,
//     );
//   });
// }
