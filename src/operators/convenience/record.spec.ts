import { constant } from '../../expressions/constant';
import { funcs } from '../../expressions/function-application';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { aggregateValue } from './aggregate-value';
import { chain } from './chain';
import { record } from './record';

describe('record', () => {
  it('sample', () => {
    const q = new QueryFactory<SampleType2>().create(
      record({
        name: chain('fieldB', 'field2'),
        rating: chain('fieldB', 'field1'),
        birthday: 'fieldA'
      })
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj2), q), emptyContext);

    expect(result).toEqual({
      name: 'ABC',
      rating: 1,
      birthday: sample1.obj2.fieldA
    });

    // @ts-expect-error
    result.notExistingField;
  });

  it('aggregate', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      record({
        count: funcs.count,
        field1Max: aggregateValue('field1', funcs.maximum)
      })
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual({
      count: 4,
      field1Max: 42
    });
  });
});
