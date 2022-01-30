import { Expression } from '../../expressions/expression';
import { ExpandRecursively } from '../../types/utils';
import { ODataCollectionExpression } from '../expressions/odata-collection';
import { isODataExpression } from '../expressions/odata-expression';
import { oDataCountField, ODataResponse } from '../helpers/definitions';
import { QueryTextBuilder } from '../helpers/query-text-builder';
import { RequestBuilder } from './request-builder';

export class ODataExecutor {

  public constructor(private readonly query: (collectionName: string, queryText: string) => Promise<ODataResponse>) {
  }

  public async execute<T>(expression: Expression<T>): Promise<ExpandRecursively<T>> {
    if (isODataExpression(expression)) {
      const builder = new RequestBuilder();
      const includeCountResult: { countFieldName: string, elementsFieldName: string } | void = builder.buildWithPossibleIncludeCount(expression);
      const queryText: string = QueryTextBuilder.buildFromRequest(builder.result);
      const rootExpression: Expression | undefined = builder.rootExpression;
      if (!(rootExpression instanceof ODataCollectionExpression)) {
        return Promise.reject('No ODataCollection root expression was found. Cannot determine OData collection name.');
      }

      const response: ODataResponse = await this.query(rootExpression.name, queryText);
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
    }

    return Promise.reject(`Unsupported expression: ${expression.constructor}`);
  }
}
