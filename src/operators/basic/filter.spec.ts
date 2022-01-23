import { constant } from '../../expressions/constant';
import { funcs } from '../../expressions/function-application';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { select } from '../../helpers/select';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { filter } from './filter';

describe('filter', () => {
  it('by equality', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter((obj) => funcs.equal(select(obj, 'field1'), constant(42)))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[3]]);
  });

  it('by negated startsWith', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter((obj) => funcs.not(funcs.startsWith(select(obj, 'field2'), constant('A'))))
    );
    const result: SampleType1[] = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([sample1.obj1s[1], sample1.obj1s[2], sample1.obj1s[3]]);
  });
});
