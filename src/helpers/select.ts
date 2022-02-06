import { Expression } from '../core/expression';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from './object-value-selector';

export function select<TIn, TSelector extends ObjectValueSelector<TIn>>(
  input: Expression<TIn>,
  selector: TSelector
): Expression<ObjectValueSelectorType<TIn, TSelector>> {
  return createQueryFromObjectValueSelector(selector).instantiate(input) as Expression<any>;
}
