// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;
import { CairoType, TypeConversionContext } from '../../utils/cairoTypeSystem.ts';
import { safeGetNodeType } from '../../utils/nodeTypeProcessing.ts';
import { isExternallyVisible } from '../../utils/utils.ts';
import { CairoASTNodeWriter } from '../base.ts';

export class ParameterListWriter extends CairoASTNodeWriter {
  writeInner(node: ParameterList, _writer: ASTWriter): SrcDesc {
    const defContext =
      node.parent instanceof FunctionDefinition && isExternallyVisible(node.parent)
        ? TypeConversionContext.CallDataRef
        : TypeConversionContext.Ref;

    const params = node.vParameters.map((value) => {
      const varTypeConversionContext =
        value.storageLocation === DataLocation.CallData
          ? TypeConversionContext.CallDataRef
          : defContext;

      const tp = CairoType.fromSol(
        safeGetNodeType(value, this.ast.inference),
        this.ast,
        varTypeConversionContext,
      );
      const isReturnParamList =
        node.parent instanceof FunctionDefinition && node.parent.vReturnParameters === node;
      // TODO: In the position of the type is written the typeString of the var. Needs to be checked the transformation
      // of that typestring into de Cairo 1 syntax for that type (Eg: dynamic arrays of some variable)
      return isReturnParamList ? tp : `${value.name} : ${tp}`;
    });
    return [params.join(', ')];
  }
}
