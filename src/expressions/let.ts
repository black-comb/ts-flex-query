import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { VariableExpression } from './variable';

export class LetExpression implements Expression {

  public get dataType(): DataType {
    return this.body.dataType;
  }

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly body: Expression
  ) {
  }

  public evaluate(context: EvaluationContext): any {
    const inputValue: unknown = evaluateExpression(this.input, context);
    const result: unknown = evaluateExpression(this.body, addVariable(context, this.variableSymbol, inputValue));
    return result;
  }
}

export function letIn<TValue, TBody>(value: Expression<TValue>, body: (v: Expression<TValue>) => Expression<TBody>): Expression<TBody> {
  if (value instanceof VariableExpression) {
    // The LetExpression is not required if the value already is a variable.
    return body(value);
  }
  const variableSymbol = Symbol('vLet');
  const variable = new VariableExpression(value.dataType, variableSymbol);
  return new LetExpression(value, variableSymbol, body(variable));
}
