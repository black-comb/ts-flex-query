import { isEqual } from 'lodash';

import { Expression } from '../../core';
import { PipeOperator } from '../../core/pipe-operator';
import {
  IfExpression,
  LetExpression,
  VariableExpression
} from '../../expressions';
import { pipeExpression } from '../../helpers';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { ifThenElse } from '../basic/if';
import { func } from './func';
import { letIn } from './let';
import { noOp } from './no-op';
import { value } from './value';

const nullCheckFunction = () => func('in', noOp(), value([null, undefined]));

/** Applies the given operator if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TOut>(
  selector: PipeOperator<NonNullable<NoInfer<TIn>>, TOut>
): PipeOperator<TIn, TOut | (TIn & (null | undefined))>;
/** Applies the given selector if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TSelector extends ObjectValueSelector<NonNullable<NoInfer<TIn>>>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<NonNullable<TIn>, TSelector> | (TIn & (null | undefined))>;
/** Applies the given selector if the input is defined. Otherwise, the input value (null or undefined) is propagated. */
export function letIfDefined<TIn, TSelector extends ObjectValueSelector<NonNullable<TIn>>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<NonNullable<TIn>, TSelector> | (TIn & (null | undefined))> {
  return letIn(
    ifThenElse(
      nullCheckFunction(),
      noOp(),
      createQueryFromObjectValueSelector(selector)
    )
  );
}

interface DefinedCheckResult {
  /** The input expression which is checked to be defined. */
  baseExpression: Expression;
  /** The symbol which is used to access the defined base expression value in the @see body. */
  baseExpressionVariableSymbol: symbol;
  /** The body expression which is only evaluated if @see baseExpression is defined. */
  body: Expression;
}

/** Unwraps an expression which was created using the @see letIfDefined operator.  */
function unwrapLetIfDefinedInternal(expression: Expression): DefinedCheckResult | undefined {
  let inputVariable: VariableExpression;
  let baseExpression: Expression;
  let ifExpression: IfExpression;
  if (expression instanceof LetExpression) {
    inputVariable = new VariableExpression(expression.input.dataType, expression.variableSymbol);
    baseExpression = expression.input;
    if (!(expression.body instanceof IfExpression)) {
      return undefined;
    }
    ifExpression = expression.body;
  } else if (expression instanceof IfExpression) {
    ifExpression = expression;
    if (!(expression.thenExpression instanceof VariableExpression)) {
      return undefined;
    }
    inputVariable = expression.thenExpression;
    baseExpression = inputVariable;
  } else {
    return undefined;
  }
  const conditionFunction = ifExpression.condition;
  const expectedFunction: Expression = pipeExpression(inputVariable, nullCheckFunction());
  if (!isEqual(conditionFunction, expectedFunction) || !isEqual(ifExpression.thenExpression, inputVariable)) {
    return undefined;
  }
  return {
    baseExpression,
    baseExpressionVariableSymbol: inputVariable.symbol,
    body: ifExpression.elseExpression
  };
}

/** Unwraps an expression which was created using the @see letIfDefined operator.  */
export function unwrapLetIfDefined(expression: Expression): DefinedCheckResult | undefined {
  return unwrapLetIfDefinedInternal(expression);
}
