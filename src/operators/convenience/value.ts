import { PipeOperator } from '../../core';
import { constant as constantExpression } from '../../expressions';
import { expression } from './expression';

export function value<TOut>(v: TOut): PipeOperator<any, NoInfer<TOut>> {
  return expression(constantExpression(v));
}
