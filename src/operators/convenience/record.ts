import { record as recordExpression } from '../../expressions/record';
import {
    createQueryFromObjectValueSelector, ObjectValueSelector, ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { createObjectFromObject } from '../../helpers/utils';
import { ApplyOperator } from '../basic/apply';
import { PipeOperator } from '../basic/pipe-operator';

export interface RecordSpec<TIn = any> {
  [key: string]: ObjectValueSelector<TIn>;
}

export type RecordOutType<TIn, TRecord extends RecordSpec> = {
  [TKey in keyof TRecord]: ObjectValueSelectorType<TIn, TRecord[TKey]>
};

export function record<TIn, TRecord extends RecordSpec<TIn>>(record: TRecord): PipeOperator<TIn, RecordOutType<TIn, TRecord>> {
  return new ApplyOperator(
    (input) => recordExpression(
      createObjectFromObject(record, (value) => createQueryFromObjectValueSelector(value).instantiate(input))
    )
  );
}
