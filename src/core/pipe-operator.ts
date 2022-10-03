import { Expression } from './expression';

export interface PipeOperator<in TIn = any, out TOut = any> {
  instantiate(input: Expression<TIn>): Expression<TOut>;
}
