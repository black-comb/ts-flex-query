import { PipeOperator } from '../../core/pipe-operator';
import { record as recordExpression } from '../../expressions/record';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { createObjectFromObject } from '../../helpers/utils';
import { TsFlexQueryTypeMarker } from '../../types/ts-flex-query-type';
import { ApplyOperator } from '../basic/apply';

export type RecordSpec<TIn = any> = Record<string, ObjectValueSelector<TIn>>;

export type RecordOutType<TIn, TRecord extends RecordSpec> = TsFlexQueryTypeMarker<'record'> & {
  [TKey in keyof TRecord]: ObjectValueSelectorType<TIn, TRecord[TKey]>
};

export function record<TIn, TRecord extends RecordSpec<TIn>>(spec: TRecord): PipeOperator<TIn, RecordOutType<TIn, TRecord>> {
  return new ApplyOperator(
    (input) => recordExpression(
      createObjectFromObject(spec, (value) => createQueryFromObjectValueSelector(value).instantiate(input))
    )
  );
}
