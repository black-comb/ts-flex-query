import { evaluateExpression } from '../helpers/evaluate-expression';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { Expression } from './expression';

export class FieldExpression implements Expression {
  public constructor(
    public readonly input: Expression,
    public readonly field: string,
    public readonly dataType: DataType
  ) {
  }

  public evaluate(context: EvaluationContext): any {
    return (evaluateExpression(this.input, context) as any)?.[this.field];
  }
}
