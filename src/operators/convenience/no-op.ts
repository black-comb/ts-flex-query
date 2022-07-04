import { PipeOperator } from '../../core/pipe-operator';
import { apply } from '../basic/apply';

export function noOp<TIn>(): PipeOperator<TIn, TIn extends any ? TIn : TIn> { // Conditional type is a workaround for successful target-typing. Test 'array with filter' in query-schema.spec.ts would not work otherwise with filter as last operator.
  return apply((input) => input) as any;
}
