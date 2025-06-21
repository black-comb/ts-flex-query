import { PipeOperator } from '../../core/pipe-operator';
import { SliceExpression } from '../../expressions/slice';
import { apply } from '../basic/apply';

export function slice<TIn extends unknown[]>(skip: number, take?: number): PipeOperator<TIn, NoInfer<TIn>> {
  return apply((input) => new SliceExpression(input, skip, take)) as PipeOperator<TIn, TIn>;
}
