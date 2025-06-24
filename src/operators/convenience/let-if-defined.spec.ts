import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from '../basic';
import { letIfDefined } from './let-if-defined';

describe('letIfDefined', () => {
  it('nullable defined object', () => {
    const q = new QueryFactory<SampleType1 | undefined>().create(
      letIfDefined('field1')
    );
    const result: number | undefined = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toEqual(1);
  });

  it('nullable undefined object', () => {
    const q = new QueryFactory<SampleType1 | undefined>().create(
      letIfDefined('field1')
    );
    const result: number | undefined = evaluateExpression(pipeExpression(constant(undefined), q), emptyContext);

    expect(result).toEqual(undefined);
  });

  it('inner operator', () => {
    const q = new QueryFactory<SampleType1 | undefined>().create(
      letIfDefined(field('field1'))
    );
    const result: number | undefined = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toEqual(1);
  });
});
