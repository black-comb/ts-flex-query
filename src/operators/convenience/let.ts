import { PipeOperator } from '../../core/pipe-operator';
import { letIn as letInExpression } from '../../expressions/let';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { ApplyOperator } from '../basic/apply';

export function letIn<TIn, TSelector extends ObjectValueSelector<TIn>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<TIn, TSelector>> {
  return new ApplyOperator((input) => letInExpression(
    input,
    (v) => createQueryFromObjectValueSelector(selector).instantiate(v)
  ));
}
