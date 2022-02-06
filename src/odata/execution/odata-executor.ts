import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Expression } from '../../core/expression';
import { ExpandRecursively } from '../../types/utils';
import { ODataCollectionExpression } from '../expressions/odata-collection';
import { isODataExpression } from '../expressions/odata-expression';
import {
  oDataCountField,
  ODataResponse
} from '../helpers/definitions';
import { QueryTextBuilder } from '../helpers/query-text-builder';
import { RequestBuilder } from './request-builder';

export interface ODataExecutionFunction {
  (collectionName: string, oDataQueryText: string): Observable<ODataResponse>;
}

export class ODataExecutor {

  public constructor(private readonly query: ODataExecutionFunction) {
  }

  public execute<T>(expression: Expression<T>): Observable<ExpandRecursively<T>> {
    if (isODataExpression(expression)) {
      const builder = new RequestBuilder();
      const includeCountResult: { countFieldName: string, elementsFieldName: string } | void = builder.buildWithPossibleIncludeCount(expression);
      const queryText: string = QueryTextBuilder.buildFromRequest(builder.result);
      const rootExpression: Expression | undefined = builder.rootExpression;
      if (!(rootExpression instanceof ODataCollectionExpression)) {
        throw new Error('No ODataCollection root expression was found. Cannot determine OData collection name.');
      }

      return this.query(rootExpression.name, queryText).pipe(
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

    throw new Error(`Unsupported expression: ${expression.constructor}`);
  }
}
