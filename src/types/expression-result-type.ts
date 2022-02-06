import { Expression } from '../core/expression';
import { ExpandRecursively } from './utils';

export type ExpressionResultType<T extends Expression> = T extends Expression<infer TResult> ? ExpandRecursively<TResult> : never;
