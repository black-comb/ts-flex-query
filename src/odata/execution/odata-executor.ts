import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Expression } from '../../core/expression';
import { EvaluatedResultType } from '../../types/evaluated-result-type';
import { ODataCollectionExpression } from '../expressions/odata-collection';
import {
  oDataCountField,
  ODataResponse
} from '../helpers/definitions';
import { QueryComposer } from '../query-composition/query-composer';
import { ODataCustomQueryComposer } from '../query-composition/types';
import { ODataExpressionHandler } from './odata-expression-handler';
import { RequestBuilder } from './request-builder';

export type ODataExecutionFunction = (collectionName: string, oDataQueryText: string) => Observable<ODataResponse>;

export interface ODataExecutorParams {
  execute: ODataExecutionFunction;
  expressionHandler?: ODataExpressionHandler;
  customQueryComposer?: ODataCustomQueryComposer;
}

export class ODataExecutor {
  /**
   * Constructor.
   * @param query The function to execute the query against the backend.
   * @param unexpandableFieldChains Specifies field chains which cannot be expanded. The select OData operator is used for these fields instead.
   */
  public constructor(
    private readonly params: ODataExecutorParams
  ) {
  }

  public execute<T>(expression: Expression<T>): Observable<EvaluatedResultType<T>> {
    const builder = new RequestBuilder(this.params);
    const includeCountResult: { countFieldName: string, elementsFieldName: string } | void = builder.buildWithPossibleIncludeCount(expression);
    const queryText: string = new QueryComposer(this.params).buildFromRequest(builder.result);
    const rootExpression: Expression | undefined = builder.rootExpression;
    if (!(rootExpression instanceof ODataCollectionExpression)) {
      throw new Error('No ODataCollection root expression was found. Cannot determine OData collection name.');
    }

    return this.params.execute(rootExpression.name, queryText).pipe(
      map((response) => {
        if (typeof response !== 'object') {
          throw new Error(`OData response must be an object with field value, but type was: ${typeof response}`);
        }

        if (includeCountResult) {
          const typedResponse: ODataResponse = response;
          return {
            [includeCountResult.countFieldName]: typedResponse[oDataCountField],
            [includeCountResult.elementsFieldName]: typedResponse.value
          } as any;
        }

        return response.value;
      })
    );
  }
}
