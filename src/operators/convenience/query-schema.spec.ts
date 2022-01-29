/* eslint-disable @typescript-eslint/no-unused-vars */

import { constant } from '../../expressions/constant';
import { Expression } from '../../expressions/expression';
import { record } from '../../expressions/record';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { SchemaFactory } from '../../helpers/schema-factory';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { QueryResultType } from '../../types/query-result-type';
import { field } from '../basic/field';
import { querySchema } from './query-schema';

describe('querySchema', () => {
  it('object for primitives', () => {
    const q = new SchemaFactory<SampleType1>().create({
      field2: true,
      field3: true
    });
    const result = evaluateExpression(pipeExpression(
      constant(sample1.obj1),
      querySchema(q)
    ), emptyContext);

    expect(result).toEqual({ field2: 'ABC', field3: undefined });

    // Type checks:
    result.field2 = 'abc';
    result.field3 = 42;
    // @ts-expect-error Expect string.
    result.field2 = 42;
    // @ts-expect-error Expect number.
    result.field3 = 'abc';
  });

  it('array for object and array', () => {
    const type1Schema = new SchemaFactory<SampleType1>().create({ field1: true });
    const expression = pipeExpression(
      constant([sample1.obj2b]),
      querySchema([{
        fieldA: true,
        fieldB: type1Schema,
        fieldC: [{
          field2: true
        }],
        fieldD: [{
          fieldD: [{
            fieldD: [{
              fieldB: {
                field3: true
              }
            }]
          }]
        }],
        fieldE: {
          fieldA: true
        }
      }])
    );
    type X = typeof expression extends Expression<infer T> ? T : never;
    const result = evaluateExpression(expression, emptyContext);

    expect(result).toEqual([{
      fieldA: sample1.obj2b.fieldA,
      fieldB: { field1: 1 },
      fieldC: [{ field2: 'ABC' }, { field2: 'ABC' }],
      fieldD: [{
        fieldD: []
      }],
      fieldE: {
        fieldA: sample1.obj2.fieldA
      }
    }]);
  });

  it('object for expression', () => {
    const result = pipeExpression(
      constant(sample1.obj1),
      querySchema({
        field1: (value) => record({ subField: value }),
        field2: (_, container) => pipeExpression(container, field('field1')),
        field3: (_, container) => container
      })
    ).evaluate?.(emptyContext);

    expect(result).toEqual({ field1: { subField: 1 }, field2: 1, field3: sample1.obj1 });
  });

  // Typing tests:
  function testQueryResult() {
    const q = new QueryFactory<SampleType2[]>().create(
      querySchema([{
        fieldA: true,
        fieldB: {
          field1: true
        },
        fieldC: [{
          field2: true
        }],
        fieldD: [{
          fieldD: [{
            fieldD: [{
              fieldB: {
                field3: true
              }
            }]
          }]
        }]
      }])
    );
    const x: QueryResultType<typeof q> = undefined as any;

    expectType<Date>()(x[0].fieldA, true);
    expectType<{ field1: number }>()(x[0].fieldB, true);
    expectType<{ field2: string }[]>()(x[0].fieldC, true);
    expectType<number | undefined>()(x[0].fieldD[0].fieldD[0].fieldD[0].fieldB.field3, true);
    // @ts-expect-error fieldD does not exist.
    x[0].fieldD[0].fieldD[0].fieldD[0].fieldD;

    new SchemaFactory<SampleType1>().create({
      field1: true,
      // @ts-expect-error: fieldNotExisting does not exist.
      fieldNotExisting: true
    });
    new SchemaFactory<SampleType1[]>().create([{
      field1: true,
      // @ts-expect-error: fieldNotExisting does not exist.
      fieldNotExisting: true
    }]);
    new SchemaFactory<SampleType2>().create({
      fieldA: true,
      fieldB: {
        field1: true,
        // @ts-expect-error: fieldNotExisting does not exist.
        fieldNotExisting: true
      },
      fieldC: [{
        field1: true,
        // @ts-expect-error: fieldNotExisting does not exist.
        fieldNotExisting: true
      }],
      fieldE: {
        fieldA: true,
        fieldB: {
          field1: true,
          // @ts-expect-error: fieldNotExisting does not exist.
          fieldNotExisting: true
        },
        fieldC: [{
          field1: true,
          // @ts-expect-error: fieldNotExisting does not exist.
          fieldNotExisting: true
        }]
      },
      // @ts-expect-error: fieldNotExisting does not exist.
      fieldNotExisting: true
    });
  }

  function testUsingContainerExpressionForRoot(): void {
    // @ts-expect-error Error expected because container argument is not provided for the root.
    const q1 = new QueryFactory<SampleType1>().createQuerySchema((_, container) => container);
  }
});
