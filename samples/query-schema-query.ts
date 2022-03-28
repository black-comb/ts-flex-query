import {
  pipeExpression,
  QueryFactory
} from 'ts-flex-query';
import {
  orderBy,
  querySchema,
  slice
} from 'ts-flex-query/operators';
import { EvaluatedQueryType } from 'ts-flex-query/types/evaluated-result-type';

import { Node } from './model';

const querySchemaQuery = new QueryFactory<Node[]>().create(
  querySchema([{ // A collection schema is an array with one object schema element.
    Id: true, // Pick the primitive field 'Id'.
    MasterNode: { // Define a sub object schema for the field 'MasterNode'.
      Id: true // Pick MasterNode's primitive field 'Id'.
    },
    AlternativeMasterNode: 'expand', // Pick all primitive fields of the sub object 'AlternativeMasterNode'.
    Facilities: [{ // Define a sub collection schema for the field 'Facilities'.
      BusinessId: true // Pick the primitive field 'BusinessId' of all facilities.
    }],
    AlternativeFacilities: ['expand'], // Pick all primitive fields of all alternative facilities.
    Providers: (p) => pipeExpression( // Order the providers by BusinessId, take the first one and query only the Id.
      p,
      orderBy('BusinessId'),
      slice(0, 1),
      querySchema([{ Id: true }])
    )
  }])
);

type ResultType = EvaluatedQueryType<typeof querySchemaQuery>;
const x: ResultType = undefined as any;
x[0].Providers[0].Id;

// type X = {
//   Id: number;
//   MasterNode: {
//       Id: number;
//   };
//   AlternativeMasterNode: PickPrimitiveFields<MasterNode>;
//   Facilities: {
//       BusinessId: number;
//   }[];
//   AlternativeFacilities: PickPrimitiveFields<Facility>[];
//   Providers: {
//       Id: number;
//   }[];
// }[]
