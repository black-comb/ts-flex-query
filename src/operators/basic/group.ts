import { Expression } from '../../expressions/expression';
import { GroupExpression, GroupResultType } from '../../expressions/group';
import { variable } from '../../expressions/variable';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { DataType, DataTypeType } from '../../types/data-type';
import { PipeOperator } from './pipe-operator';

export class GroupOperator implements PipeOperator {
  public static readonly elementsField = 'elements';
  public static readonly groupValueField = 'key';

  public constructor(public readonly groupValue: (element: Expression<any>) => Expression) {
  }

  public instantiate(input: Expression): Expression<any> {
    const variableSymbol = Symbol('vGroup');
    const variableType: DataType = input.dataType.type === DataTypeType.array
      ? input.dataType.elementType
      : { type: DataTypeType.unknown };
    const variableExpression: Expression = variable(variableType, variableSymbol);
    return new GroupExpression(input, variableSymbol, this.groupValue(variableExpression), GroupOperator.elementsField, GroupOperator.groupValueField);
  }
}

export function groupBy<TIn extends unknown[], TGroupValue>(
  groupValueSelector: PipeOperator<TIn[number], TGroupValue>
): PipeOperator<TIn, GroupResultType<TIn, TGroupValue, (typeof GroupOperator)['elementsField'], (typeof GroupOperator)['groupValueField']>>;
export function groupBy<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  groupValueSelector: TSelector
): PipeOperator<TIn, GroupResultType<TIn, ObjectValueSelectorType<TIn[number], TSelector>, (typeof GroupOperator)['elementsField'], (typeof GroupOperator)['groupValueField']>>;
export function groupBy(
  groupValueSelector: ObjectValueSelector
): PipeOperator {
  return new GroupOperator((element) => createQueryFromObjectValueSelector(groupValueSelector).instantiate(element));
}
