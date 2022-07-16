import { Expression } from '../../core';
import { ODataRequest } from '../helpers/definitions';

export interface ExpressionHandlerParams {
  /** The unknown expression. */
  expression: Expression;
  /** The current request before applying inner expressions. */
  currentRequest: ODataRequest;
}

export interface ExpressionHandlerResult {
  /**
   * The inner expression of the unknown expression.
   * For example, the inner expression of a filter expression would be the expression defining the list the filter is applied to.
   */
  innerExpression: Expression;
  /**
   * The new request after handler application.
   * This is usually the currentRequest (see ExpressionHandlerParams), extended with additional information, e.g., in the customValues.
   */
  newRequest: ODataRequest;
}

/** Handles an unknown expression during OData request creation. */
export interface ODataExpressionHandler {
  (params: ExpressionHandlerParams): ExpressionHandlerResult | null;
}
