import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class SpecifyTypeExpression implements Expression {
  public constructor(
    public readonly input: Expression,
    public readonly dataType: DataType
  ) {
  }

  public evaluate(context: EvaluationContext): unknown {
    return evaluateExpression(this.input, context);
  }
}

export function specifyType<T>(input: Expression<T>, dataType: DataType): Expression<T> {
  return new SpecifyTypeExpression(input, dataType) as Expression<T>;
}
