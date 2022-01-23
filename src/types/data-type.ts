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

export interface ObjectDataType {
  readonly type: DataTypeType.object;
  fields: Partial<Record<PropertyKey, DataType>>;
}

export interface ArrayDataType {
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

export interface UnknownDataType {
  readonly type: DataTypeType.unknown | DataTypeType.unknownPrimitive | DataTypeType.unknownObject | DataTypeType.unknownArray;
}

export type DataType =
  | ObjectDataType
  | ArrayDataType
  | LiteralDataType
  | UnionDataType
  | UnknownDataType;
