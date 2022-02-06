import { Expression } from '../../core/expression';
import {
  DataType,
  DataTypeType
} from '../../types/data-type';

export class ODataCollectionExpression implements Expression {

  public readonly dataType: DataType = { type: DataTypeType.array, elementType: { type: DataTypeType.unknownObject } };

  public constructor(public readonly name: string) {
  }

}

export function oDataCollection<T>(name: string): Expression<T[]> {
  return new ODataCollectionExpression(name);
}
