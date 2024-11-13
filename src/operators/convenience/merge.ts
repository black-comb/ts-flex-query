import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import { func } from '../../expressions/function-application';
import { internal } from '../../functions/internal';
import { apply } from '../basic/apply';

export type MergeOutType<in out TIn extends Record<PropertyKey, any>, in out TObj extends Record<PropertyKey, any>> =
  {
    [TKey in keyof TIn | keyof TObj]:
    TKey extends keyof TObj
      ? TKey extends keyof TIn
        ? TIn[TKey] extends Record<PropertyKey, any>
          ? TObj[TKey] extends Record<PropertyKey, any>
            ? MergeOutType<TIn[TKey], TObj[TKey]>
            : TObj[TKey]
          : TObj[TKey]
        : TObj[TKey]
      : TKey extends keyof TIn
        ? TIn[TKey]
        : never
  };

export function merge<TIn extends Record<PropertyKey, any>, TObj extends Record<PropertyKey, any>>(
  obj: Expression<TObj>
): PipeOperator<TIn, MergeOutType<TIn, TObj>> {
  return apply((input) => func(internal, 'mergeObjects', input, obj) as Expression<MergeOutType<TIn, TObj>>);
}
