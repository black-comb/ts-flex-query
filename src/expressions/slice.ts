import { evaluateExpression } from '../helpers/evaluate-expression';
import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';
import { Expression } from './expression';

export class SliceExpression implements Expression {
  public get dataType(): DataType {
    return this.input.dataType;
  }

  public constructor(
    public readonly input: Expression,
    public readonly skip: number,
    public readonly take: number
  ) {
  }

  public evaluate(context: EvaluationContext): any[] {
    const inputResult: unknown = evaluateExpression(this.input, context);
    return Array.isArray(inputResult) ? inputResult.slice(this.skip, this.skip + this.take) : [];
  }
}
