import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { not } from '../convenience/boolean';
import { func } from '../convenience/func';
import { value } from '../convenience/value';
import { field } from './field';
import { filter } from './filter';

describe('filter', () => {
  fit('by equality', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(func('equal', field('field1'), value(42)))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[3]]);
  });

  it('by negated startsWith', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(not(func('startsWith', field('field2'), value('A'))))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[2], sample1.obj1s[3]]);
  });
});
