import { PipeOperator } from '../../core';
import { funcs } from '../../expressions/function-application';
import { apply } from '../basic';
import { func } from './func';
import { value } from './value';

function reduceBooleanOperands<TIn>(functionKey: 'and' | 'or', defaultValue: boolean, operands: PipeOperator<TIn, boolean>[]): PipeOperator<TIn, boolean> {
  return operands.length ? operands.reduce((prev, op) => func(functionKey, prev, op)) : value(defaultValue);
}

export function and<TIn>(...operands: NoInfer<PipeOperator<TIn, boolean>[]>): PipeOperator<TIn, boolean> {
  return reduceBooleanOperands('and', true, operands);
}

export function or<TIn>(...operands: NoInfer<PipeOperator<TIn, boolean>[]>): PipeOperator<TIn, boolean> {
  return reduceBooleanOperands('or', false, operands);
}

export function not<TIn>(operand: NoInfer<PipeOperator<TIn, boolean>>): PipeOperator<TIn, boolean> {
  return func('not', operand);
}

export function negate(): PipeOperator<boolean, boolean> {
  return apply(funcs.not);
}
