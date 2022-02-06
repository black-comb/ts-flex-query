import { PipeOperator } from '../../core/pipe-operator';
import { apply } from '../basic/apply';

export function noOp<TIn>(): PipeOperator<TIn, TIn> {
  return apply((input) => input) as PipeOperator<TIn, TIn>;
}
