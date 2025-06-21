import { SampleType1 } from './types/sample-type-1';
import { SampleType2 } from './types/sample-type-2';

const obj1: SampleType1 = {
  field1: 1,
  field2: 'ABC'
};

const obj1s: SampleType1[] = [
  obj1,
  {
    field1: 42,
    field2: 'DEF',
    field3: 15
  },
  {
    field1: 41,
    field2: 'GHI',
    field3: 11
  },
  {
    field1: 42,
    field2: 'JKL',
    field3: 13
  }
];

const obj2: SampleType2 = {
  fieldA: new Date('2021-12-16 18:50:00'),
  fieldB: obj1,
  fieldC: [obj1],
  fieldD: [],
  fieldE: undefined,
  fieldF: undefined,
  fieldG: obj1s[1]
};

const obj2b: SampleType2 = {
  fieldA: new Date('2022-12-16 18:50:00'),
  fieldB: obj1,
  fieldC: [obj1, obj1],
  fieldD: [obj2],
  fieldE: obj2,
  fieldF: [obj2],
  fieldG: obj1s[2]
};

const obj2s: SampleType2[] = [obj2, obj2b];

export const sample1 = {
  obj1,
  obj1s,
  obj2,
  obj2b,
  obj2s
};
