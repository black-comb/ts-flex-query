import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from './field';
import { orderBy } from './sort';

describe('sort', () => {
  it('sample', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      orderBy('field1', [field('field3'), 'desc'])
    );
    const expr = pipeExpression(
      constant(sample1.obj1s),
      q
    );
    const result = evaluateExpression(expr, emptyContext);

    expect(result).toEqual([
      sample1.obj1s[0],
      sample1.obj1s[2],
      sample1.obj1s[1],
      sample1.obj1s[3]
    ])
  });
});
