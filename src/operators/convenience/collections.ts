import { PipeOperator } from '../../core';
import { funcs } from '../../expressions';
import { apply } from '../basic';

export function distinct<TIn extends unknown[]>(): PipeOperator<TIn, TIn> {
  return apply(funcs.distinct) as PipeOperator<TIn, TIn>;
}

export function first<TIn>(): PipeOperator<TIn[] | undefined, TIn | undefined> {
  return apply(funcs.first) as PipeOperator<TIn[] | undefined, TIn | undefined>;
}
