import { PipeOperator } from '../../core';
import { IfExpression } from '../../expressions/if';
import { value } from '../convenience';

/** Returns the @see thenValue if @see condition evaluates to true. Otherwise, returns undefined. */
export function ifThen<TInput, TThen>(
  condition: PipeOperator<TInput, boolean>,
  thenValue: PipeOperator<TInput, TThen>
): PipeOperator<TInput, TThen | undefined> {
  return ifThenElse(condition, thenValue, value(undefined));
}

/** Returns the @see thenValue if @see condition evaluates to true and @see elseValue otherwise. */
export function ifThenElse<TInput, TThen, TElse>(
  condition: PipeOperator<TInput, boolean>,
  thenValue: PipeOperator<TInput, TThen>,
  elseValue: PipeOperator<TInput, TElse>
): PipeOperator<TInput, TThen | TElse> {
  return {
    instantiate: (input) => new IfExpression(condition.instantiate(input), thenValue.instantiate(input), elseValue.instantiate(input))
  };
}
