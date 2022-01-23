import { evaluateExpression } from '../helpers/evaluate-expression';
import { createObjectFromObject } from '../helpers/utils';
import { DataType, DataTypeType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { ExpressionResultType } from '../types/expression-result-type';
import { Expression } from './expression';

export class RecordExpression implements Expression {
  public readonly dataType: DataType;

  constructor(public readonly fields: Partial<Record<PropertyKey, Expression>>) {
    this.dataType = {
      type: DataTypeType.object,
      fields: createObjectFromObject(fields, (expr) => expr.dataType)
    };
  }

  public evaluate(context: EvaluationContext): any {
    return createObjectFromObject(this.fields, (field) => evaluateExpression(field, context));
  }
}

type RecordType<TFields extends Partial<Record<PropertyKey, Expression>>> = {
  [field in keyof TFields]: ExpressionResultType<NonNullable<TFields[field]>>
};

export function record<TFields extends Partial<Record<PropertyKey, Expression>>>(fields: TFields): Expression<RecordType<TFields>> {
  return new RecordExpression(fields);
}
