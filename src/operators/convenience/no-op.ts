import { apply } from '../basic/apply';
import { PipeOperator } from '../basic/pipe-operator';

export function noOp<TIn>(): PipeOperator<TIn, TIn> {
  return apply((input) => input) as PipeOperator<TIn, TIn>;
}
