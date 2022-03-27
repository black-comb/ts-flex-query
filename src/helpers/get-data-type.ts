import {
  DataType,
  DataTypeType
} from '../types/data-type';
import {
  createObjectFromArray,
  unexpected
} from './utils';

export function getDataType(value: unknown): DataType {
  const type = typeof value;
  switch (type) {
    case 'number':
      return { type: DataTypeType.number };
    case 'bigint':
      return { type: DataTypeType.bigint };
    case 'symbol':
    case 'string':
      return { type: DataTypeType.string };
    case 'boolean':
      return { type: DataTypeType.boolean };
    case 'undefined':
      return { type: DataTypeType.undefined };
    case 'object':
      if (value === null) {
        return { type: DataTypeType.null };
      }
      if (Array.isArray(value)) {
        return {
          type: DataTypeType.array,
          elementType: value.length ? getDataType(value[0]) : { type: DataTypeType.unknown }
        };
      }
      return {
        type: DataTypeType.object,
        fields: createObjectFromArray(Object.entries(value as object), entry => entry[0], entry => getDataType(entry[1]))
      };
    case 'function':
      throw new Error('Functions are not supported in queries.');
    default:
      return unexpected(type);
  }
}
