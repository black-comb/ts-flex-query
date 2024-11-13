import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import {
  createUnion,
  DataType
} from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class IfExpression implements Expression {
  public readonly dataType: DataType;

  public constructor(
    public readonly condition: Expression,
    public readonly thenExpression: Expression,
    public readonly elseExpression: Expression
  ) {
    this.dataType = createUnion(thenExpression.dataType, elseExpression.dataType);
  }

  public evaluate(context: EvaluationContext): any {
    const condition = !!evaluateExpression(this.condition, context);
    return condition ? evaluateExpression(this.thenExpression, context) : evaluateExpression(this.elseExpression, context);
  }
}
