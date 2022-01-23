import { Expression } from '../../expressions/expression';
import {
    createQueryFromObjectValueSelector, ObjectValueSelector, ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { PipeOperator } from './pipe-operator';

export class ApplyOperator implements PipeOperator {
  constructor(private readonly f: (input: Expression<any>) => Expression) {
  }

  public instantiate(input: Expression<unknown>): Expression<any> {
    return this.f(input);
  }
}

export function apply<TIn, TSelector extends ObjectValueSelector<TIn>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<TIn, TSelector>> {
  return new ApplyOperator((input) => createQueryFromObjectValueSelector(selector).instantiate(input));
}
