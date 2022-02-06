import { flatten } from 'lodash';

import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class FlatMapExpression implements Expression {

  public readonly dataType: DataType;

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly body: Expression
  ) {
    this.dataType = body.dataType;
  }

  public evaluate(context: EvaluationContext): any {
    const inputValue: unknown = evaluateExpression(this.input, context);
    const elementsResult: any[] = Array.isArray(inputValue)
      ? inputValue.map((element) => this.evaluateInnerArray(addVariable(context, this.variableSymbol, element)))
      : [];
    return flatten(elementsResult);
  }

  private evaluateInnerArray(context: EvaluationContext): any {
    const result: unknown = evaluateExpression(this.body, context);
    return result;
  }
}
