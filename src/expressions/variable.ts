import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { Expression } from './expression';

export class VariableExpression implements Expression {
  constructor(public readonly dataType: DataType, public readonly symbol: symbol) {
  }

  public evaluate(context: EvaluationContext): any {
    return context.variables[this.symbol];
  }
}

export function variable<TValue>(dataType: DataType, semanticIdentifier: symbol): Expression<TValue> {
  return new VariableExpression(dataType, semanticIdentifier);
}
