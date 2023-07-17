import { isEqual } from 'lodash';

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
    || dataType.type === DataTypeType.unknownArray
    || (dataType.type === DataTypeType.union && dataType.types.every(isExpansionDataType));
}

export function createUnion(type1: DataType, type2: DataType): DataType {
  function checkSymmetrically(check: (t1: DataType, t2: DataType) => DataType | undefined): DataType | undefined {
    return check(type1, type2) ?? check(type2, type1);
  }

  if (isEqual(type1, type2)) {
    return type1;
  }
  const specificResult: DataType | undefined = checkSymmetrically(
    (t1, t2) => {
      switch (t1.type) {
        case DataTypeType.array:
          switch (t2.type) {
            case DataTypeType.null:
            case DataTypeType.undefined:
              return t1; // Arrays are nullable.
            case DataTypeType.unknownArray:
              return t2;
          }
          break;
        case DataTypeType.object:
          switch (t2.type) {
            case DataTypeType.null:
            case DataTypeType.undefined:
              return t1; // Objects are nullable.
            case DataTypeType.unknownObject:
              return t2;
          }
          break;
        case DataTypeType.bigint:
        case DataTypeType.boolean:
        case DataTypeType.number:
        case DataTypeType.string:
          if (t2.type === DataTypeType.unknownPrimitive) {
            return t2;
          }
          break;
        case DataTypeType.union: {
          if (t2.type === DataTypeType.union) {
            return t2.types.reduce((acc, t) => createUnion(acc, t), t1);
          }
          const mergableType = t1.types
            .map((t, index) => ({ union: createUnion(t, t2), index }))
            .filter(({ union }) => union.type !== DataTypeType.union)[0];
          if (mergableType) {
            return {
              type: DataTypeType.union,
              types: t1.types.map((t, i) => i === mergableType.index ? mergableType.union : t)
            };
          }
          break;
        }
        case DataTypeType.unknown:
          return t1;
      }
      return undefined;
    }
  );
  return specificResult ?? { type: DataTypeType.union, types: [type1, type2] };
}
