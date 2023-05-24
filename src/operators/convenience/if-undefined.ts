import {
  Expression,
  PipeOperator
} from '../../core';
import { internal } from '../../functions';
import { expression } from './expression';
import { customFunc } from './func';
import { noOp } from './no-op';

/** Applies a fallback value if the input is undefined or null. */
export function ifUndefined<TIn, TFallback>(
  fallbackValue: Expression<TFallback>
): PipeOperator<TIn, NonNullable<TIn> | TFallback> {
  return customFunc(internal, 'ifUndefined', noOp(), expression(fallbackValue)) as PipeOperator<TIn, NonNullable<TIn> | TFallback>;
  //apply((input) => func(internal, 'mergeObjects', input, obj) as Expression<MergeOutType<TIn, TObj>>);
  // return ifThenElse(
  //   or(func('equal', noOp(), value(undefined)), func('equal', noOp(), value(null))),
  //   expression(fallbackValue),
  //   noOp() as PipeOperator<TIn, NonNullable<TIn>>
  // );
}
