import { groupBy } from 'lodash';

import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import {
  DataType,
  DataTypeType
} from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class GroupExpression implements Expression {
  public readonly dataType: DataType;

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly groupValue: Expression,
    public readonly elementsField: string,
    public readonly groupValueField: string
  ) {
    this.dataType = {
      type: DataTypeType.array,
      elementType: {
        type: DataTypeType.object,
        fields: {
          [elementsField]: input.dataType,
          [groupValueField]: groupValue.dataType
        }
      }
    };
  }

  public evaluate(context: EvaluationContext): unknown {
    const inputResult: unknown = evaluateExpression(this.input, context);
    if (!Array.isArray(inputResult)) {
      return [];
    }
    const groups = groupBy(inputResult, (element) => JSON.stringify(this.evaluateGroupValue(element, context)));
    return Object.values(groups).map((elements) => ({
      [this.elementsField]: elements,
      [this.groupValueField]: this.evaluateGroupValue(elements[0], context)
    }));
  }

  private evaluateGroupValue(elementValue: unknown, context: EvaluationContext): unknown {
    const elementContext: EvaluationContext = addVariable(context, this.variableSymbol, elementValue);
    return evaluateExpression(this.groupValue, elementContext);
  }
}

export type GroupResultType<TIn extends unknown[], TGroupValue, TElementsField extends string, TGroupValueField extends string> =
  ({
    [TKey in TElementsField]: TIn;
  } & {
    [TKey in TGroupValueField]: TGroupValue;
  })[];
