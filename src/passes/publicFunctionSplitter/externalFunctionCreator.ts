// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { AST } from '../../ast/ast.ts';
import { ASTMapper } from '../../ast/mapper.ts';
import { cloneASTNode } from '../../utils/cloning.ts';
import { TranspilationAbandonedError } from '../../utils/errors.ts';
import { INTERNAL_FUNCTION_SUFFIX } from '../../utils/nameModifiers.ts';
import { createBlock, createIdentifier, createReturn } from '../../utils/nodeTemplates.ts';
import { getFunctionTypeString, getReturnTypeString } from '../../utils/getTypeString.ts';
export class ExternalFunctionCreator extends ASTMapper {
  constructor(
    public internalToExternalFunctionMap: Map<FunctionDefinition, FunctionDefinition>,
    public internalFunctionCallSet: Set<FunctionDefinition>,
  ) {
    super();
  }
  /*
  This class will visit each function definition. If the function definition is public it will
  create an external counterpart. The visited function will then be changed to internal and have 
  the suffix _internal added to the name. 

  The internal and external functions will be added to the Maps above to be used in the next pass 
  to modify the function calls. All internal function calls to the original function will need to 
  be renamed and all contract to contract calls need to have their referenced changed to the external 
  function (Still not supported yet). 
  */

  visitFunctionDefinition(node: FunctionDefinition, ast: AST): void {
    if (node.vScope instanceof ContractDefinition && node.vScope.kind === ContractKind.Interface) {
      return;
    }

    if (FunctionVisibility.Public === node.visibility && node.kind !== FunctionKind.Constructor) {
      if (this.internalFunctionCallSet.has(node)) {
        const newExternalFunction = this.createExternalFunctionDefinition(node, ast);
        this.insertReturnStatement(node, newExternalFunction, ast);
        this.modifyPublicFunction(node);
        this.internalToExternalFunctionMap.set(node, newExternalFunction);
      } else {
        node.visibility = FunctionVisibility.External;
      }
    }
    this.commonVisit(node, ast);
  }

  private modifyPublicFunction(node: FunctionDefinition): void {
    node.visibility = FunctionVisibility.Internal;
    node.name = `${node.name}${INTERNAL_FUNCTION_SUFFIX}`;
  }

  private createExternalFunctionDefinition(node: FunctionDefinition, ast: AST): FunctionDefinition {
    const newBlock = createBlock([], ast);
    const internalFunctionBody = node.vBody;
    node.vBody = undefined;
    const externalFunction = cloneASTNode(node, ast);

    externalFunction.vBody = newBlock;
    externalFunction.acceptChildren();
    externalFunction.visibility = FunctionVisibility.External;

    node.vBody = internalFunctionBody;
    return externalFunction;
  }

  private insertReturnStatement(
    node: FunctionDefinition,
    externalFunction: FunctionDefinition,
    ast: AST,
  ): void {
    const internalFunctionCallArguments: Expression[] =
      externalFunction.vParameters.vParameters.map((parameter) => {
        return createIdentifier(parameter, ast, undefined, node);
      });
    const internalFunctionCall = createCallToInternalFunction(
      node,
      internalFunctionCallArguments,
      ast,
    );

    const newReturnFunctionCall = createReturn(
      internalFunctionCall,
      externalFunction.vReturnParameters.id,
      ast,
    );

    externalFunction.vBody?.appendChild(newReturnFunctionCall);
    node.getClosestParentByType(ContractDefinition)?.appendChild(externalFunction);
    ast.setContextRecursive(externalFunction);
  }
}

function createCallToInternalFunction(
  functionDef: FunctionDefinition,
  argList: Expression[],
  ast: AST,
  nodeInSourceUnit?: ASTNode,
): FunctionCall {
  const contract = functionDef.getClosestParentByType(ContractDefinition);

  if (contract === undefined) {
    throw new TranspilationAbandonedError(
      `Function ${functionDef.name} is not a member of any contract`,
    );
  }

  const functionIdentifier = new Identifier(
    ast.reserveId(),
    '',
    getFunctionTypeString(functionDef, ast.inference, nodeInSourceUnit),
    functionDef.name,
    functionDef.id,
  );

  return new FunctionCall(
    ast.reserveId(),
    '',
    getReturnTypeString(functionDef, ast, nodeInSourceUnit),
    FunctionCallKind.FunctionCall,
    functionIdentifier,
    argList,
  );
}
