import { PipeOperator } from '../../core/pipe-operator';
import { funcs } from '../../expressions';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { QueryFactory } from '../../helpers/query-factory';
import { TsFlexQueryTypeMarker } from '../../types/ts-flex-query-type';
import { letIn } from './let';
import { noOp } from './no-op';
import { record } from './record';

const countFieldName = 'count';
const elementsFieldName = 'elements';

export function includeCount<TIn extends unknown[], TOut>(
  elementsSelector: PipeOperator<TIn, TOut>
): PipeOperator<TIn, TsFlexQueryTypeMarker<'record'> & { [countFieldName]: number, [elementsFieldName]: TOut }>;
export function includeCount<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn>>(
  elementsSelector: TSelector
): PipeOperator<TIn, TsFlexQueryTypeMarker<'record'> & { [countFieldName]: number, [elementsFieldName]: ObjectValueSelectorType<TIn, TSelector> }>;
export function includeCount<TIn extends unknown[]>(
): PipeOperator<TIn, TsFlexQueryTypeMarker<'record'> & { [countFieldName]: number, [elementsFieldName]: TIn }>;
export function includeCount(
  elementsSelector?: ObjectValueSelector
): PipeOperator {
  const q = new QueryFactory<any>().create(
    letIn(record({
      [countFieldName]: funcs.count,
      [elementsFieldName]: elementsSelector
        ? createQueryFromObjectValueSelector(elementsSelector)
        : noOp()
    }))
  );
  return q;
}
