import { Expression } from '../core/expression';
import { EvaluatedResultType } from '../types/evaluated-result-type';
import { EvaluationContext } from '../types/evaluation-context';

export function evaluateExpression<T>(expression: Expression<T>, context: EvaluationContext): EvaluatedResultType<T, true> {
  if (!expression.evaluate) {
    throw new Error('Expression is not evaluatable: ' + JSON.stringify(expression));
  }
  return expression.evaluate(context) as EvaluatedResultType<T, true>;
}
