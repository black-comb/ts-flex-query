/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { constant } from '../expressions/constant';
import { field } from '../operators/basic/field';
import { querySchema } from '../operators/convenience/query-schema';
import { sample1 } from '../tests/sample-1';
import { SampleType1 } from '../tests/types/sample-type-1';
import { SampleType2 } from '../tests/types/sample-type-2';
import { emptyContext } from './evaluation-context-utils';
import { pipeExpression } from './pipe-expression';
import { QueryFactory } from './query-factory';

describe('QueryFactory', () => {
  it('one operator', () => {
    const q = new QueryFactory<SampleType1>().create(
      field('field1')
    );
    const result = pipeExpression(constant(sample1.obj1), q).evaluate!(emptyContext);
    expect(result).toEqual(1);

    const x: number = result;
    // @ts-expect-error result is number.
    const y: string = result;
  });

  it('two operators', () => {
    const q = new QueryFactory<SampleType2>().create(
      field('fieldC'),
      querySchema([{ field2: true }])
    );
    const result = pipeExpression(constant(sample1.obj2), q).evaluate!(emptyContext);
    expect(result).toEqual([{ field2: 'ABC' }]);

    const x: { field2: string }[] = result;
    // @ts-expect-error result is not a string.
    const y: string = result;
  });
});
