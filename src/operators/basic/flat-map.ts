import { Expression } from '../../expressions/expression';
import { FlatMapExpression } from '../../expressions/flat-map';
import { variable } from '../../expressions/variable';
import {
    createQueryFromObjectValueSelector,
    ObjectValueSelector,
    ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { DataTypeType } from '../../types/data-type';
import { Error } from '../../types/utils';
import { PipeOperator } from './pipe-operator';

export class FlatMapOperator implements PipeOperator {
  public static readonly inputIdentifier = Symbol('inputIdentifier');

  constructor(public readonly mapper: (input: Expression<any>) => Expression) {
  }

  public instantiate(input: Expression): Expression<any> {
    const variableSymbol = Symbol('vFlatMap');
    const variableExpression = variable(
      input.dataType.type === DataTypeType.array ? input.dataType.elementType : { type: DataTypeType.unknownArray },
      variableSymbol
    );
    return new FlatMapExpression(input, variableSymbol, this.mapper(variableExpression));
  }
}

export function flatMap<TIn extends unknown[], TOut extends unknown[]>(
  selector: PipeOperator<TIn[number], TOut>
): PipeOperator<TIn, TOut>;
export function flatMap<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  selector: ObjectValueSelectorType<TIn[number], TSelector> extends unknown[] ? TSelector : Error<'Selected value must be an array.'>
): PipeOperator<TIn, ObjectValueSelectorType<TIn[number], TSelector>>;
export function flatMap<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  selector: ObjectValueSelectorType<TIn[number], TSelector> extends unknown[] ? TSelector : Error<'Selected value must be an array.'>
): PipeOperator<TIn, ObjectValueSelectorType<TIn[number], TSelector>> {
  return new FlatMapOperator((input) => createQueryFromObjectValueSelector(selector).instantiate(input));
}
