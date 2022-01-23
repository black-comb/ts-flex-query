import { SliceExpression } from '../../expressions/slice';
import { apply } from '../basic/apply';
import { PipeOperator } from '../basic/pipe-operator';

export function slice<TIn extends unknown[]>(skip: number, take: number): PipeOperator<TIn, TIn> {
  return apply((input) => new SliceExpression(input, skip, take)) as PipeOperator<TIn, TIn>;
}
