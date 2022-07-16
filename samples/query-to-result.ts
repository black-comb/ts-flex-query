import {
  evaluateExpression,
  pipeExpression,
  QueryFactory
} from 'ts-flex-query';
import { constant } from 'ts-flex-query/expressions';
import {
  oDataCollection,
  ODataExecutor
} from 'ts-flex-query/odata';
import { querySchema } from 'ts-flex-query/operators';
import { EvaluatedQueryType } from 'ts-flex-query/types';

import { Node } from './model';

const query = new QueryFactory<Node[]>().create(
  querySchema([{
    Id: true
  }])
);

type ResultType = EvaluatedQueryType<typeof query>;

interface ViewModel {
  ids: number[];
}

function convertToViewModel(serverData: ResultType): ViewModel {
  return { ids: serverData.map((x) => x.Id) };
}

// JS evaluator
const listOfNodes: Node[] = undefined as any; // getListOfNodes();

// 1. Apply the query to a constant input expression:
const expr1 = pipeExpression(constant(listOfNodes), query);

// 2. Evaluate the query:
const result1 = evaluateExpression(expr1);
// Work with the result.

// OData evaluator
// 1. Apply the query to an oDataCollection input expression:
const expr2 = pipeExpression(oDataCollection<Node>('Nodes'), query);

// 2. Evaluate the query:
const evaluator = new ODataExecutor({
  execute: (collectionName, queryText) => {
    // Go to your OData endpoint here using collectionName and queryText.
    return undefined as any;
  }
});
evaluator.execute(expr2).subscribe((result) => {
  // Work with the result.
})
