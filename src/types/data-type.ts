export enum DataTypeType {
  object = 'object',
  array = 'array',
  string = 'string',
  number = 'number',
  bigint = 'bigint',
  boolean = 'boolean',
  undefined = 'undefined',
  null = 'null',
  union = 'union',
  unknown = 'unknown',

  // Partially known types:
  unknownPrimitive = 'unknownPrimitive',
  unknownObject = 'unknownObject',
  unknownArray = 'unknownArray'
}

interface ExpansionDataTypeBase {
  /** If OData is used and this is true or undefined, the respective field is included in the $expand clause. */
  isExpandable?: boolean;
}

export interface ObjectDataType extends ExpansionDataTypeBase {
  readonly type: DataTypeType.object;
  fields: Partial<Record<PropertyKey, DataType>>;
}

export interface ArrayDataType extends ExpansionDataTypeBase {
  readonly type: DataTypeType.array;
  elementType: DataType;
}

export interface LiteralDataType {
  readonly type: DataTypeType.string | DataTypeType.number | DataTypeType.bigint | DataTypeType.boolean | DataTypeType.undefined | DataTypeType.null;
}

export interface UnionDataType {
  readonly type: DataTypeType.union;
  types: DataType[];
}

export interface UnknownExpansionDataType extends ExpansionDataTypeBase {
  readonly type: DataTypeType.unknownObject | DataTypeType.unknownArray;
}

export interface UnknownNotExpandableDataType {
  readonly type: DataTypeType.unknown | DataTypeType.unknownPrimitive;
}

export type UnknownDataType = UnknownExpansionDataType | UnknownNotExpandableDataType;

export type ExpansionDataType = ObjectDataType | ArrayDataType | UnknownExpansionDataType;

export type DataType =
  | ObjectDataType
  | ArrayDataType
  | LiteralDataType
  | UnionDataType
  | UnknownDataType;

export function isExpansionDataType(dataType: DataType): dataType is ExpansionDataType {
  return dataType.type === DataTypeType.object
    || dataType.type === DataTypeType.array
    || dataType.type === DataTypeType.unknownObject
    || dataType.type === DataTypeType.unknownArray;
}
