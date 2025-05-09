import { Expression } from '../core/expression';
import { PipeOperator } from '../core/pipe-operator';

export function pipeExpression<T1, T2>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>
): Expression<T2>;
export function pipeExpression<T1, T2, T3>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<T2, T3>
): Expression<T3>;
export function pipeExpression<T1, T2, T3, T4>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>
): Expression<T4>;
export function pipeExpression<T1, T2, T3, T4, T5>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>
): Expression<T5>;
export function pipeExpression<T1, T2, T3, T4, T5, T6>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>
): Expression<T6>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>,
  operator6: PipeOperator<NoInfer<T6>, T7>
): Expression<T7>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>,
  operator6: PipeOperator<NoInfer<T6>, T7>,
  operator7: PipeOperator<NoInfer<T7>, T8>
): Expression<T8>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>,
  operator6: PipeOperator<NoInfer<T6>, T7>,
  operator7: PipeOperator<NoInfer<T7>, T8>,
  operator8: PipeOperator<NoInfer<T8>, T9>
): Expression<T9>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>,
  operator6: PipeOperator<NoInfer<T6>, T7>,
  operator7: PipeOperator<NoInfer<T7>, T8>,
  operator8: PipeOperator<NoInfer<T8>, T9>,
  operator9: PipeOperator<NoInfer<T9>, T10>
): Expression<T10>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
  input: Expression<T1>,
  operator1: PipeOperator<NoInfer<T1>, T2>,
  operator2: PipeOperator<NoInfer<T2>, T3>,
  operator3: PipeOperator<NoInfer<T3>, T4>,
  operator4: PipeOperator<NoInfer<T4>, T5>,
  operator5: PipeOperator<NoInfer<T5>, T6>,
  operator6: PipeOperator<NoInfer<T6>, T7>,
  operator7: PipeOperator<NoInfer<T7>, T8>,
  operator8: PipeOperator<NoInfer<T8>, T9>,
  operator9: PipeOperator<NoInfer<T9>, T10>,
  operator10: PipeOperator<NoInfer<T10>, T11>
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
