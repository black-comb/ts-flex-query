import { ConstantExpression } from './constant';
import { Expression } from './expression';
import { FieldExpression } from './field';
import { FilterExpression } from './filter';
import { FlatMapExpression } from './flat-map';
import { FunctionApplicationExpression } from './function-application';
import { GroupExpression } from './group';
import { LetExpression } from './let';
import { MapExpression } from './map';
import { RecordExpression } from './record';
import { SliceExpression } from './slice';
import { SortExpression } from './sort';
import { VariableExpression } from './variable';

export type FrameworkExpression =
  | ConstantExpression
  | FieldExpression
  | FilterExpression
  | FlatMapExpression
  | FunctionApplicationExpression
  | GroupExpression
  | LetExpression
  | MapExpression
  | RecordExpression
  | SliceExpression
  | SortExpression
  | VariableExpression;

export function isFrameworkExpression(expression: Expression): expression is FrameworkExpression {
  return expression instanceof ConstantExpression
    || expression instanceof FieldExpression
    || expression instanceof FilterExpression
    || expression instanceof FlatMapExpression
    || expression instanceof FunctionApplicationExpression
    || expression instanceof GroupExpression
    || expression instanceof LetExpression
    || expression instanceof MapExpression
    || expression instanceof RecordExpression
    || expression instanceof SliceExpression
    || expression instanceof SortExpression
    || expression instanceof VariableExpression;
}
