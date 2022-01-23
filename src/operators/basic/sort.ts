import { Expression } from '../../expressions/expression';
import {
    SortExpression,
    SortSpecification as ExpressionSortSpecification
} from '../../expressions/sort';
import { variable } from '../../expressions/variable';
import {
    createQueryFromObjectValueSelector,
    ObjectValueSelector
} from '../../helpers/object-value-selector';
import { DataType, DataTypeType } from '../../types/data-type';
import { PipeOperator } from './pipe-operator';

export class SortOperator implements PipeOperator {

  constructor(public readonly specs: SortSpecification[]) {
  }

  public instantiate(input: Expression): Expression<any> {
    const variableSymbol = Symbol('vSort');
    const inputType: DataType = input.dataType;
    const variableExpr = variable(inputType.type === DataTypeType.array ? inputType.elementType : { type: DataTypeType.unknown }, variableSymbol);
    const specs: ExpressionSortSpecification[] = this.specs.map((spec) => ({
      value: createQueryFromObjectValueSelector(spec.value).instantiate(variableExpr),
      isAscending: spec.isAscending
    }));
    return new SortExpression(input, variableSymbol, specs);
  }

}

interface SortSpecification<T = any> {
  value: ObjectValueSelector<T>;
  isAscending: boolean;
}

type SortElement<T> = ObjectValueSelector<T> | [ObjectValueSelector<T>, 'asc' | 'desc'];

export function orderBy<T>(...elements: SortElement<T>[]): PipeOperator<T[], T[]> {
  const specs: SortSpecification[] = elements.map((element) => Array.isArray(element)
    ? ({ value: element[0], isAscending: element[1] === 'asc' })
    : ({ value: element, isAscending: true }));
  return new SortOperator(specs);
}
