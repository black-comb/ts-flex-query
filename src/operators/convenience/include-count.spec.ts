import { sortBy } from 'lodash';

import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { orderBy } from '../basic';
import { pipe } from '../basic/combine';
import { includeCount } from './include-count';
import { querySchema } from './query-schema';

describe('include-count', () => {
  it('with selector', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      includeCount((e) => pipeExpression(
        e,
        querySchema([{
          field1: true,
          field2: true
        }])
      ))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual({
      count: sample1.obj1s.length,
      elements: sample1.obj1s.map((x) => ({ field1: x.field1, field2: x.field2 }))
    });
  });

  it('with pipe selector', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      includeCount(pipe(
        orderBy('field1'),
        querySchema([{
          field1: true,
          field2: true
        }])
      ))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual({
      count: sample1.obj1s.length,
      elements: sortBy(sample1.obj1s, (x) => x.field1).map((x) => ({ field1: x.field1, field2: x.field2 }))
    });
  });

  it('without selector', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      includeCount()
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual({
      count: sample1.obj1s.length,
      elements: sample1.obj1s
    });
  });
});
