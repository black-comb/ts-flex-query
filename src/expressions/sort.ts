import { orderBy } from 'lodash';

import { Expression } from '../core/expression';
import { evaluateExpression } from '../helpers/evaluate-expression';
import { addVariable } from '../helpers/evaluation-context-utils';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export class SortExpression implements Expression {
  public get dataType(): DataType {
    return this.input.dataType;
  }

  public constructor(
    public readonly input: Expression,
    public readonly variableSymbol: symbol,
    public readonly specs: SortSpecification[]
  ) {
  }

  public evaluate(context: EvaluationContext): any {
    const inputResult: unknown = evaluateExpression(this.input, context);
    if (!Array.isArray(inputResult)) {
      return undefined;
    }
    return orderBy(
      inputResult,
      this.specs.map((spec) => (value) => {
        const valueContext: EvaluationContext = addVariable(context, this.variableSymbol, value);
        return evaluateExpression(spec.value, valueContext);
      }),
      this.specs.map((spec) => spec.isAscending ? 'asc' : 'desc')
    );
  }
}

export interface SortSpecification {
  value: Expression;
  isAscending: boolean;
}
