import { PipeOperator } from '../../core/pipe-operator';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { ifThenElse } from '../basic/if';
import { func } from './func';
import { letIn } from './let';
import { noOp } from './no-op';
import { value } from './value';

/** Applies the given selector if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TOut>(
  selector: PipeOperator<NonNullable<TIn>, TOut>
): PipeOperator<TIn, TOut | (TIn & (null | undefined))>;
/** Applies the given selector if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TSelector extends ObjectValueSelector<NonNullable<TIn>>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<NonNullable<TIn>, TSelector> | (TIn & (null | undefined))>;
/** Applies the given selector if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TSelector extends ObjectValueSelector<NonNullable<TIn>>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<NonNullable<TIn>, TSelector> | (TIn & (null | undefined))> {
  return letIn(
    ifThenElse(
      func('in', noOp(), value([null, undefined])),
      noOp(),
      createQueryFromObjectValueSelector(selector)
    )
  );
}
