import { PipeOperator } from '../../core/pipe-operator';
import { apply } from '../basic/apply';

export function noOp<TIn>(): PipeOperator<TIn, NoInfer<TIn>> {
  return apply((input) => input) as any;
}
