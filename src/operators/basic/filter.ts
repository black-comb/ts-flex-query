import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import { FilterExpression } from '../../expressions/filter';
import { variable } from '../../expressions/variable';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import {
  DataType,
  DataTypeType
} from '../../types/data-type';
import { Error } from '../../types/utils';

export class FilterOperator implements PipeOperator {
  public constructor(private readonly predicate: (input: Expression<any>) => Expression<boolean>) {
  }

  public instantiate(input: Expression): Expression<any> {
    const variableSymbol = Symbol('vFilter');
    const variableType: DataType = input.dataType.type === DataTypeType.array
      ? input.dataType.elementType
      : { type: DataTypeType.unknown };
    const variableExpression: Expression = variable(variableType, variableSymbol);
    return new FilterExpression(input, variableSymbol, this.predicate(variableExpression));
  }
}

export function filter<TIn extends unknown[]>(
  selector: PipeOperator<TIn[number], boolean>
): PipeOperator<TIn, TIn>;
export function filter<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  selector: ObjectValueSelectorType<TIn[number], TSelector> extends boolean ? TSelector : Error<'Selected value must have boolean type.'>
): PipeOperator<TIn, TIn>;
export function filter<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  selector: ObjectValueSelectorType<TIn[number], TSelector> extends boolean ? TSelector : Error<'Selected value must have boolean type.'>
): PipeOperator<TIn, TIn> {
  return new FilterOperator((input) => createQueryFromObjectValueSelector(selector).instantiate(input) as Expression<boolean>);
}
