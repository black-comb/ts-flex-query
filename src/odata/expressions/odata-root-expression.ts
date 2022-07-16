import { Expression } from '../../core/expression';
import { FieldExpression } from '../../expressions/field';
import { VariableExpression } from '../../expressions/variable';
import { ODataCollectionExpression } from './odata-collection';

export type ODataRootExpression = FieldExpression | VariableExpression | ODataCollectionExpression;

export function isODataRootExpression(expression: Expression): expression is ODataRootExpression {
  return expression instanceof FieldExpression || expression instanceof VariableExpression || expression instanceof ODataCollectionExpression;
}
