import {
  Expression,
  PipeOperator
} from '../../core';
import { apply } from '../basic';

export function expression<TOut>(expr: Expression<TOut>): PipeOperator<any, TOut> {
  return apply(() => expr);
}
