import { Expression } from '../expressions/expression';
import { EvaluationContext } from '../types/evaluation-context';
import { ExpandRecursively } from '../types/utils';

export function evaluateExpression<T>(expression: Expression<T>, context: EvaluationContext): ExpandRecursively<T> {
  if (!expression.evaluate) {
    throw new Error('Expression is not evaluatable: ' + JSON.stringify(expression));
  }
  return expression.evaluate(context) as ExpandRecursively<T>;
}
