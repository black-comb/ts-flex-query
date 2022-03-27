import { PipeOperator } from '../../core/pipe-operator';
import {
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { QueryFactory } from '../../helpers/query-factory';
import { apply } from '../basic/apply';
import { map } from '../basic/map';

export function aggregateValue<TIn, TValue, TOut>(
  valueSelector: PipeOperator<TIn, TValue>,
  aggregateSelector: PipeOperator<TValue[], TOut>
): PipeOperator<TIn[], TOut>;
export function aggregateValue<TIn, TValue, TAggregateSelector extends ObjectValueSelector<TValue[]>>(
  valueSelector: PipeOperator<TIn, TValue>,
  aggregateSelector: TAggregateSelector
): PipeOperator<TIn[], ObjectValueSelectorType<TValue[], TAggregateSelector>>;
export function aggregateValue<TIn, TValueSelector extends ObjectValueSelector<TIn>, TOut>(
  valueSelector: TValueSelector,
  aggregateSelector: PipeOperator<ObjectValueSelectorType<TIn, TValueSelector>[], TOut>
): PipeOperator<TIn[], TOut>;
export function aggregateValue<TIn, TValueSelector extends ObjectValueSelector<TIn>, TAggregateSelector extends ObjectValueSelector<ObjectValueSelectorType<TIn, TValueSelector>[]>>(
  valueSelector: TValueSelector,
  aggregateSelector: TAggregateSelector
): PipeOperator<TIn[], ObjectValueSelectorType<ObjectValueSelectorType<TIn, TValueSelector>[], TAggregateSelector>>;
export function aggregateValue<TIn, TValueSelector extends ObjectValueSelector<TIn>, TAggregateSelector extends ObjectValueSelector<ObjectValueSelectorType<TIn, TValueSelector>[]>>(
  valueSelector: TValueSelector,
  aggregateSelector: TAggregateSelector
): PipeOperator<TIn[], ObjectValueSelectorType<ObjectValueSelectorType<TIn, TValueSelector>[], TAggregateSelector>> {
  return new QueryFactory<TIn[]>().create(
    map(valueSelector),
    apply(aggregateSelector)
  );
}
