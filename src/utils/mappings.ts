// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
;

export function getMappingTypes(v: MappingType): TypeNode[] {
  const isMapping = v.valueType instanceof MappingType;
  return [v.keyType, ...(isMapping ? getMappingTypes(v.valueType) : [v.valueType])];
}
