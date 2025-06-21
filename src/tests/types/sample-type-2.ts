import { SampleType1 } from './sample-type-1';

export interface SampleType2 {
  fieldA: Date;
  fieldB: SampleType1;
  fieldC: SampleType1[];
  fieldD: SampleType2[];
  fieldE: SampleType2 | undefined;
  fieldF: SampleType2[] | undefined;
  fieldG: SampleType1;
}
