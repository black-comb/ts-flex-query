import { PipeOperator } from '../../core/pipe-operator';
import { func } from '../../expressions/function-application';
import { RecordExpression } from '../../expressions/record';
import { Aggregation } from '../../functions/aggregation';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { QueryFactory } from '../../helpers/query-factory';
import { TsFlexQueryTypeMarker } from '../../types/ts-flex-query-type';
import { letIn } from './let';

const countFieldName = 'count';
const elementsFieldName = 'elements';

export function includeCount<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn>>(
  elementsSelector: TSelector
): PipeOperator<TIn, TsFlexQueryTypeMarker<'record'> & { [countFieldName]: number, [elementsFieldName]: ObjectValueSelectorType<TIn, TSelector> }>;
export function includeCount<TIn extends unknown[]>(
): PipeOperator<TIn, TsFlexQueryTypeMarker<'record'> & { [countFieldName]: number, [elementsFieldName]: TIn }>;
export function includeCount(
  elementsSelector?: ObjectValueSelector
): PipeOperator {
  const q = new QueryFactory<any>().create(
    letIn((input) => new RecordExpression({
      [countFieldName]: func(Aggregation, 'count', input),
      [elementsFieldName]: elementsSelector
        ? createQueryFromObjectValueSelector(elementsSelector).instantiate(input)
        : input
    }))
  );
  return q;
}
