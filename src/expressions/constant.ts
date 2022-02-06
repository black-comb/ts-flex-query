import { Expression } from '../core/expression';
import { getDataType } from '../helpers/get-data-type';
import { DataType } from '../types/data-type';

export class ConstantExpression implements Expression<any> {
  public readonly dataType: DataType;

  public constructor(public readonly value: unknown) {
    this.dataType = getDataType(value);
  }

  public evaluate(): any {
    return this.value;
  }
}

export function constant<TValue>(value: TValue): Expression<TValue> {
  return new ConstantExpression(value);
}
