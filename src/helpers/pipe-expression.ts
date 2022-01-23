import { Expression } from '../expressions/expression';
import { PipeOperator } from '../operators/basic/pipe-operator';

// type PipeArgs<TIn, TArgs extends any[]> =
//   TArgs extends [infer TFirst, ...infer TRest]
//   ? [Operator<TIn, TFirst>, ...PipeArgs<TFirst, TRest>]
//   : [];

// export function pipe<TIn, TOperators extends PipeArgs<TIn, any>>(
//   input: Query<TIn>,
//   ...operators: TOperators
// ): TOperators extends PipeArgs<any, any>
//   ? Query<boolean>
//   : Query<TIn> {
//   return operators.reduce((q: Query<any>, op: Operator<any, any>) => op(q), input) as any;
// }

// export function pipe<T1, T2>(
//   input: Query<T1>,
//   operator1: QueryOperator<T1, T2>
// ): Query<T2>;
// export function pipe<T1, T2, T3>(
//   input: Query<T1>,
//   operator1: QueryOperator<T1, T2>,
//   operator2: QueryOperator<T2, T3>
// ): Query<T3>;
// export function pipe<T1, T2, T3, T4>(
//   input: Query<T1>,
//   operator1: QueryOperator<T1, T2>,
//   operator2: QueryOperator<T2, T3>,
//   operator3: QueryOperator<T3, T4>
//   ): Query<T4>;
// export function pipe(
//   input: Query<any>,
//   ...operators: QueryOperator<any, any>[]
// ): Query<any> {
//   return operators.reduce((q: Query<any>, op: QueryOperator<any, any>) => op(q), input) as any;
//   // const result = operator1(input);
//   // return result;
// }

export function pipeExpression<T1, T2>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>
): Expression<T2>;
export function pipeExpression<T1, T2, T3>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>
): Expression<T3>;
export function pipeExpression<T1, T2, T3, T4>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>
): Expression<T4>;
export function pipeExpression<T1, T2, T3, T4, T5>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>
): Expression<T5>;
export function pipeExpression<T1, T2, T3, T4, T5, T6>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>
): Expression<T6>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>
): Expression<T7>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>,
  operator7: PipeOperator<T7, T8>
): Expression<T8>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>,
  operator7: PipeOperator<T7, T8>,
  operator8: PipeOperator<T8, T9>
): Expression<T9>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>,
  operator7: PipeOperator<T7, T8>,
  operator8: PipeOperator<T8, T9>,
  operator9: PipeOperator<T9, T10>
): Expression<T10>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>,
  operator7: PipeOperator<T7, T8>,
  operator8: PipeOperator<T8, T9>,
  operator9: PipeOperator<T9, T10>,
  operator10: PipeOperator<T10, T11>
): Expression<T11>;
export function pipeExpression(
  input: Expression,
  ...operators: PipeOperator[]
): Expression {
  return operators.reduce(
    (expr: Expression, op: PipeOperator) => op.instantiate(expr),
    input
  ) as any;
}
