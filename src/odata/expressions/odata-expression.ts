import { Expression } from '../../core/expression';
import { ConstantExpression } from '../../expressions/constant';
import { FieldExpression } from '../../expressions/field';
import { FilterExpression } from '../../expressions/filter';
import { LetExpression } from '../../expressions/let';
import { MapExpression } from '../../expressions/map';
import { RecordExpression } from '../../expressions/record';
import { SliceExpression } from '../../expressions/slice';
import { SortExpression } from '../../expressions/sort';
import { VariableExpression } from '../../expressions/variable';
import { ODataCollectionExpression } from './odata-collection';

export type ODataRootExpression = VariableExpression | ODataCollectionExpression;

export type ODataPipeExpression =
  | FieldExpression
  | FilterExpression
  | LetExpression
  | MapExpression
  | SliceExpression
  | SortExpression;

export type ODataExpression =
  | ConstantExpression
  | RecordExpression
  | ODataPipeExpression
  | ODataRootExpression;

export function isODataRootExpression(expression: Expression): expression is ODataRootExpression {
  return expression instanceof VariableExpression || expression instanceof ODataCollectionExpression;
}

export function isODataPipeExpression(expression: Expression): expression is ODataPipeExpression {
  return expression instanceof FieldExpression
    || expression instanceof FilterExpression
    || expression instanceof LetExpression
    || expression instanceof MapExpression
    || expression instanceof SliceExpression
    || expression instanceof SortExpression;
}

export function isODataExpression(expression: Expression): expression is ODataExpression {
  return expression instanceof ConstantExpression
    || expression instanceof RecordExpression
    || isODataPipeExpression(expression)
    || isODataRootExpression(expression);
}
