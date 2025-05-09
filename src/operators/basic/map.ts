import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import { MapExpression } from '../../expressions/map';
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

export class MapOperator implements PipeOperator {
  public constructor(public readonly mapper: (input: Expression<any>) => Expression) {
  }

  public instantiate(input: Expression): Expression<any> {
    const variableSymbol = Symbol('vMap');
    const variableType: DataType = input.dataType.type === DataTypeType.array
      ? input.dataType.elementType
      : { type: DataTypeType.unknown };
    const variableExpression: Expression = variable(variableType, variableSymbol);
    return new MapExpression(input, variableSymbol, this.mapper(variableExpression));
  }
}

export function map<TIn extends unknown[], TOut>(
  selector: PipeOperator<NoInfer<TIn>[number], TOut>
): PipeOperator<TIn, TOut[]>;
export function map<TIn extends unknown[], TSelector extends ObjectValueSelector<NoInfer<TIn>[number]>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<TIn[number], TSelector>[]>;
export function map<TIn extends unknown[], TSelector extends ObjectValueSelector<NoInfer<TIn>[number]>>(
  selector: TSelector
): PipeOperator<TIn, ObjectValueSelectorType<TIn[number], TSelector>[]> {
  return new MapOperator((input) => createQueryFromObjectValueSelector(selector).instantiate(input));
}
