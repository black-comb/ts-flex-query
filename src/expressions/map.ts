import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import {
  DataType,
  DataTypeType
} from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class MapExpression implements Expression {
  public readonly dataType: DataType;

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly body: Expression
  ) {
    this.dataType = { type: DataTypeType.array, elementType: body.dataType };
  }

  public evaluate(context: EvaluationContext): any {
    const inputValue: unknown = evaluateExpression(this.input, context);
    const elementsResult: any[] = Array.isArray(inputValue)
      ? inputValue.map((element) => evaluateExpression(this.body, addVariable(context, this.variableSymbol, element)))
      : [];
    return elementsResult;
  }
}
