import { Expression } from '../core/expression';
import { PipeOperator } from '../core/pipe-operator';
import { ApplyOperator } from '../operators/basic/apply';
import { FieldOperator } from '../operators/basic/field';
import { IfPrimitive } from '../types/utils';
import { unexpected } from './utils';

export type ObjectValueSelector<T = any> =
  | keyof T & string
  | ((obj: Expression<T>) => Expression)
  | PipeOperator<T>;

export type ObjectValueSelectorType<TObj, TSelector extends ObjectValueSelector> =
  TSelector extends keyof TObj
  ? TObj[TSelector]
  : TSelector extends PipeOperator<TObj, infer TOut>
  ? TOut
  : TSelector extends ((obj: Expression<any>) => Expression<infer TResult>)
  ? TResult
  : never;

export type PrimitiveObjectValueSelector<TObj, TSelector extends ObjectValueSelector> =
  IfPrimitive<ObjectValueSelectorType<TObj, TSelector>, TSelector, [TObj, 'Selected value must be primitve.']>;

export function createQueryFromObjectValueSelector(selector: ObjectValueSelector): PipeOperator {
  switch (typeof selector) {
    case 'string':
      return new FieldOperator(selector);
    case 'object':
      return selector;
    case 'function':
      return new ApplyOperator(selector);
    default:
      return unexpected(selector);
  }
}
