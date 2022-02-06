import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class FilterExpression implements Expression {
  public get dataType(): DataType {
    return this.input.dataType;
  }

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly body: Expression<boolean>
  ) {
  }

  public evaluate(context: EvaluationContext): unknown[] {
    const inputResult: unknown = evaluateExpression(this.input, context);
    if (!Array.isArray(inputResult)) {
      return [];
    }
    return inputResult.filter((element) => {
      const innerContext: EvaluationContext = addVariable(context, this.variableSymbol, element);
      return evaluateExpression(this.body, innerContext);
    });
  }
}
