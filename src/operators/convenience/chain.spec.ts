import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { chain } from './chain';

describe('chain', () => {
  it('length of three', () => {
    const q = new QueryFactory<SampleType2>().create(
      chain('fieldE', 'fieldB', 'field2')
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj2b), q), emptyContext);

    expect(result).toEqual('ABC');
  });
});
