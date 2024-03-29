import { Expression } from '../core/expression';
import { ConstantExpression } from './constant';
import { FieldExpression } from './field';
import { FilterExpression } from './filter';
import { FlatMapExpression } from './flat-map';
import { FunctionApplicationExpression } from './function-application';
import { GroupExpression } from './group';
import { IfExpression } from './if';
import { LetExpression } from './let';
import { MapExpression } from './map';
import { RecordExpression } from './record';
import { SliceExpression } from './slice';
import { SortExpression } from './sort';
import { SpecifyTypeExpression } from './specify-type';
import { VariableExpression } from './variable';

export type FrameworkExpression =
  | ConstantExpression
  | FieldExpression
  | FilterExpression
  | FlatMapExpression
  | FunctionApplicationExpression
  | GroupExpression
  | IfExpression
  | LetExpression
  | MapExpression
  | RecordExpression
  | SliceExpression
  | SortExpression
  | SpecifyTypeExpression
  | VariableExpression;

export function isFrameworkExpression(expression: Expression): expression is FrameworkExpression {
  return expression instanceof ConstantExpression
    || expression instanceof FieldExpression
    || expression instanceof FilterExpression
    || expression instanceof FlatMapExpression
    || expression instanceof FunctionApplicationExpression
    || expression instanceof GroupExpression
    || expression instanceof IfExpression
    || expression instanceof LetExpression
    || expression instanceof MapExpression
    || expression instanceof RecordExpression
    || expression instanceof SliceExpression
    || expression instanceof SortExpression
    || expression instanceof SpecifyTypeExpression
    || expression instanceof VariableExpression;
}
