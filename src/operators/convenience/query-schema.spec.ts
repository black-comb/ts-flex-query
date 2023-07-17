/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Expression } from '../../core/expression';
import { constant } from '../../expressions/constant';
import { record } from '../../expressions/record';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { SchemaFactory } from '../../helpers/schema-factory';
import { serializeExpressionForDebugging } from '../../helpers/serialize-expression-for-debugging';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { QueryResultType } from '../../types/query-result-type';
import { field } from '../basic/field';
import { filter } from '../basic/filter';
import { func } from './func';
import { letIn } from './let';
import { querySchema } from './query-schema';
import { slice } from './slice';
import { value } from './value';

describe('querySchema', () => {
  it('object for primitives', () => {
    const q = new SchemaFactory<SampleType1>().create({
      field2: true,
      field3: true
    });
    const expression = pipeExpression(
      constant(sample1.obj1),
      letIn(x => record({ field2: pipeExpression(x, field('field2')), field3: pipeExpression(x, field('field3')) })),
      querySchema(q)
    );
    const result = evaluateExpression(expression, emptyContext);
    console.log(serializeExpressionForDebugging(expression));

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

  it('undefined sub object', () => {
    const expression = pipeExpression(
      constant(sample1.obj2),
      querySchema({
        fieldE: {
          fieldA: true
        }
      })
    );
    type X = typeof expression extends Expression<infer T> ? T : never;
    const result = evaluateExpression(expression);

    expect(result).toEqual({ fieldE: undefined });
  });

  it('object for expression', () => {
    const result = pipeExpression(
      constant(sample1.obj1),
      querySchema({
        field1: (v) => record({ subField: v }),
        field2: (_, container) => pipeExpression(container, field('field1')),
        field3: (_, container) => container
      })
    ).evaluate?.(emptyContext);

    expect(result).toEqual({ field1: { subField: 1 }, field2: 1, field3: sample1.obj1 });
  });

  it('object for expanded object and array', () => {
    const result = evaluateExpression(
      pipeExpression(
        constant(sample1.obj2),
        querySchema({
          fieldB: 'expand',
          fieldC: ['expand']
        })
      ),
      emptyContext
    );

    const expected: typeof result = {
      fieldB: sample1.obj2.fieldB,
      fieldC: sample1.obj2.fieldC
    };
    expect(result).toEqual({ fieldB: sample1.obj2.fieldB, fieldC: sample1.obj2.fieldC });
  });

  it('array with filter', () => {
    const q = new QueryFactory<SampleType2[]>().create(
      querySchema([{
        fieldC: (objs) => pipeExpression(
          objs,
          //filter((x) => funcs.lower(pipeExpression(x, field('field1')), constant(2))),
          filter(func('lower', field('field1'), value(2))),
          slice(3, 1),
          querySchema([{ field1: true }])
        )
      }])
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj2s), q));
  });

  // Typing tests:
  function testQueryResult(): void {
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

    new QueryFactory<SampleType2>().create(
      // @ts-expect-error: Invalid schema.
      querySchema({
        fieldA: true,
        fieldNotExisting: true
      })
    );
  }

  function testUsingContainerExpressionForRoot(): void {
    // @ts-expect-error Error expected because container argument is not provided for the root.
    const q1 = new QueryFactory<SampleType1>().createQuerySchema((_, container) => container);
  }
});
