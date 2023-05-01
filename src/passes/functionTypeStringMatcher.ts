// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../ast/ast.ts';
import { ASTMapper } from '../ast/mapper.ts';

;

import { isReferenceType, safeGetNodeType, specializeType } from '../utils/nodeTypeProcessing.ts';
import { generateExpressionTypeString } from '../utils/getTypeString.ts';

export class FunctionTypeStringMatcher extends ASTMapper {
  // Function to add passes that should have been run before this pass
  addInitialPassPrerequisites(): void {
    const passKeys: Set<string> = new Set<string>([]);
    passKeys.forEach((key) => this.addPassPrerequisite(key));
  }

  visitFunctionCall(node: FunctionCall, ast: AST): void {
    const funcType = safeGetNodeType(node.vExpression, ast.inference);
    if (
      node.vArguments.length === 0 ||
      node.kind === FunctionCallKind.TypeConversion ||
      node.vFunctionCallType === ExternalReferenceType.Builtin ||
      !(node.vReferencedDeclaration instanceof FunctionDefinition) ||
      !(funcType instanceof FunctionType)
    ) {
      this.commonVisit(node, ast);
      return;
    }

    const inputTypes = node.vReferencedDeclaration.vParameters.vParameters.map((varDecl) => {
      const type = safeGetNodeType(varDecl, ast.inference);
      return isReferenceType(type) ? specializeType(type, varDecl.storageLocation) : type;
    });
    const outputTypes = node.vReferencedDeclaration.vReturnParameters.vParameters.map((varDecl) => {
      const type = safeGetNodeType(varDecl, ast.inference);
      return isReferenceType(type) ? specializeType(type, varDecl.storageLocation) : type;
    });

    const newFuncType = new FunctionType(
      funcType.name,
      inputTypes,
      outputTypes,
      funcType.visibility,
      funcType.mutability,
      funcType.implicitFirstArg,
      funcType.src,
    );

    const funcTypeString = generateExpressionTypeString(newFuncType);

    node.vExpression.typeString = funcTypeString;
  }
}
