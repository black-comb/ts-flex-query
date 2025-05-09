import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';

export class ApplyOperator implements PipeOperator {
  public constructor(private readonly f: (input: Expression<any>) => Expression) {
  }

  public instantiate(input: Expression<unknown>): Expression<any> {
    return this.f(input);
  }
}

export function apply<TIn, TSelector extends ObjectValueSelector<NoInfer<TIn>>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<TIn, TSelector>> {
  return new ApplyOperator((input) => createQueryFromObjectValueSelector(selector).instantiate(input));
}
