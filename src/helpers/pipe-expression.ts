import { Expression } from '../core/expression';
import { PipeOperator } from '../core/pipe-operator';

/*
 * A note on NoInfer:
 * Using parameters of type PipeOperator<NoInfer<Tx>, Tx+1> for the pipeExpression functions does not properly work
 * with the querySchema operator. The actual reason is unknown yet, types look good.
 */

export function pipeExpression<T1, T2>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>
): NoInfer<Expression<T2>>;
export function pipeExpression<T1, T2, T3>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>
): NoInfer<Expression<T3>>;
export function pipeExpression<T1, T2, T3, T4>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>
): NoInfer<Expression<T4>>;
export function pipeExpression<T1, T2, T3, T4, T5>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>
): NoInfer<Expression<T5>>;
export function pipeExpression<T1, T2, T3, T4, T5, T6>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>
): NoInfer<Expression<T6>>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>
): NoInfer<Expression<T7>>;
export function pipeExpression<T1, T2, T3, T4, T5, T6, T7, T8>(
  input: Expression<T1>,
  operator1: PipeOperator<T1, T2>,
  operator2: PipeOperator<T2, T3>,
  operator3: PipeOperator<T3, T4>,
  operator4: PipeOperator<T4, T5>,
  operator5: PipeOperator<T5, T6>,
  operator6: PipeOperator<T6, T7>,
  operator7: PipeOperator<T7, T8>
): NoInfer<Expression<T8>>;
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
): NoInfer<Expression<T9>>;
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
): NoInfer<Expression<T10>>;
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
): NoInfer<Expression<T11>>;
export function pipeExpression(
  input: Expression,
  ...operators: PipeOperator[]
): Expression {
  return operators.reduce(
    (expr: Expression, op: PipeOperator) => op.instantiate(expr),
    input
  ) as any;
}
