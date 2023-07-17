/* eslint-disable @typescript-eslint/no-unused-expressions */
import { QueryFactory } from '../helpers';
import { expectType } from '../helpers/utils';
import { querySchema } from '../operators';
import { SampleType1 } from '../tests/types/sample-type-1';
import { SampleType2 } from '../tests/types/sample-type-2';
import { EvaluatedResultType } from './evaluated-result-type';
import { QueryResultType } from './query-result-type';

function assertEvaluatedResultTypeIsCorrect(): void {
  const x1: EvaluatedResultType<number> = undefined as any;
  expectType<number>()(x1, true);

  const x2: EvaluatedResultType<number | undefined> = undefined as any;
  expectType<number | undefined>()(x2, true);
  // @ts-expect-error x2 is expected to be number | undefined.
  expectType<number>()(x2, true);

  const x3: EvaluatedResultType<SampleType1> = undefined as any;
  expectType<number>()(x3.field1, true);
  expectType<string>()(x3.field2, true);
  expectType<number | undefined>()(x3.field3, true);
  // @ts-expect-error x3.field3 is expected to be number | undefined.
  expectType<number>()(x3.field3, true);

  const x4: EvaluatedResultType<SampleType2> = undefined as any;
  expectType<Date>()(x4.fieldA, true);
  // @ts-expect-error fieldB is not primitive.
  x4.fieldB;
  // @ts-expect-error fieldC is not primitive.
  x4.fieldC;

  const q5 = new QueryFactory<SampleType2[]>().create(
    querySchema([{
      fieldB: {
        field1: true
      },
      fieldE: {
        fieldA: true
      }
    }])
  );
  const x5: EvaluatedResultType<QueryResultType<typeof q5>> = undefined as any;
  expectType<{ field1: number }>()(x5[0].fieldB, true);
  expectType<{ fieldA: Date } | undefined>()(x5[0].fieldE, true);
  // @ts-expect-error fieldE is nullable.
  expectType<{ fieldA: Date }>()(x5[0].fieldE, true);
}
