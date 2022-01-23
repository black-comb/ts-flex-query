import { PipeOperator } from '../operators/basic/pipe-operator';
import { ExpandRecursively } from './utils';

export type QueryResultType<TQuery extends PipeOperator> =
  TQuery extends PipeOperator<any, infer TResult> ? ExpandRecursively<TResult> : never;
