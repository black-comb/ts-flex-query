import { Expression } from './expression';

export interface PipeOperator<TIn = any, TOut = any> {
  instantiate(input: Expression<TIn>): Expression<TOut>;
}
