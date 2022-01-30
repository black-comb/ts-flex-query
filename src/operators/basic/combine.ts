import { Expression } from '../../expressions/expression';
import { PipeOperator } from './pipe-operator';

export class CombineOperator implements PipeOperator {
  public constructor(public readonly operators: PipeOperator[]) {
  }

  public instantiate(input: Expression): Expression {
    return this.operators.reduce((acc, op) => op.instantiate(acc), input);
  }
}
