import {
  pipeExpression,
  QueryFactory
} from 'ts-flex-query';
import { constant } from 'ts-flex-query/expressions';
import {
  first,
  pipe
} from 'ts-flex-query/operators';
import {
  EvaluatedExpressionType,
  EvaluatedQueryType
} from 'ts-flex-query/types';

import { Node } from './model';

const firstNodeQuery =
  new QueryFactory<Node[]>().create(
    first()
  );

const firstNodeQueryB =
  new QueryFactory<Node[]>().create(
    pipe(first())
  );

type ResultType = EvaluatedQueryType<typeof firstNodeQuery>;
const result: ResultType = undefined as any;
const name: string | undefined = result?.Name;

type ResultTypeB = EvaluatedQueryType<typeof firstNodeQueryB>;
const resultB: ResultTypeB = undefined as any;
const nameB: string | undefined = resultB?.Name;

const firstNodeExpression = pipeExpression(constant<Node[]>([]), first());
type ExpressionResultType = EvaluatedExpressionType<typeof firstNodeExpression>;
const result2: ExpressionResultType = undefined as any;
const name2: string | undefined = result2?.Name;
