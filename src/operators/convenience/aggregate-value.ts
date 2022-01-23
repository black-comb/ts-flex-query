import { ObjectValueSelector, ObjectValueSelectorType } from '../../helpers/object-value-selector';
import { QueryFactory } from '../../helpers/query-factory';
import { apply } from '../basic/apply';
import { map } from '../basic/map';
import { PipeOperator } from '../basic/pipe-operator';

export function aggregateValue<TIn, TValueSelector extends ObjectValueSelector<TIn>, TAggregateSelector extends ObjectValueSelector<ObjectValueSelectorType<TIn, TValueSelector>[]>>(
  valueSelector: TValueSelector,
  aggregateSelector: TAggregateSelector
): PipeOperator<TIn[], ObjectValueSelectorType<ObjectValueSelectorType<TIn, TValueSelector>[], TAggregateSelector>> {
  return new QueryFactory<TIn[]>().create(
    map(valueSelector),
    apply(aggregateSelector)
  );
}
