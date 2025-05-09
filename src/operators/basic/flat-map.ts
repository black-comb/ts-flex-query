import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import { FlatMapExpression } from '../../expressions/flat-map';
import { variable } from '../../expressions/variable';
import {
  createQueryFromObjectValueSelector,
  ObjectValueSelector,
  ObjectValueSelectorType
} from '../../helpers/object-value-selector';
import { DataTypeType } from '../../types/data-type';
import { Error } from '../../types/utils';

export class FlatMapOperator implements PipeOperator {
  public static readonly inputIdentifier = Symbol('inputIdentifier');

  public constructor(public readonly mapper: (input: Expression<any>) => Expression) {
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
  selector: PipeOperator<NoInfer<TIn>[number], TOut | undefined>
): PipeOperator<TIn, TOut>;
export function flatMap<TIn extends unknown[], TSelector extends ObjectValueSelector<NoInfer<TIn>[number]>>(
  selector: ObjectValueSelectorType<NoInfer<TIn>[number], TSelector> extends unknown[] | undefined ? TSelector : Error<'Selected value must be an array.'>
): PipeOperator<TIn, NonNullable<ObjectValueSelectorType<TIn[number], TSelector>>>;
export function flatMap<TIn extends unknown[], TSelector extends ObjectValueSelector<TIn[number]>>(
  selector: ObjectValueSelectorType<TIn[number], TSelector> extends unknown[] ? TSelector : Error<'Selected value must be an array.'>
): PipeOperator<TIn, NonNullable<ObjectValueSelectorType<TIn[number], TSelector>>> {
  return new FlatMapOperator((input) => createQueryFromObjectValueSelector(selector as ObjectValueSelector<TIn[number]>).instantiate(input));
}
