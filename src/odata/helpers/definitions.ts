import { functionContainers } from '../../functions/main';

export const oDataCountField = '@odata.count';

type ODataAtomicSerializable = string | symbol | number | bigint | boolean | Date | undefined | null;

export type ODataSerializable = ODataAtomicSerializable | ODataAtomicSerializable[];

export interface ODataResponse<T = any> {
  [oDataCountField]: number;
  value: T;
}

export type ODataExpand = Record<string, ODataRequest | null>;

export interface ODataGroupBy {
  readonly type: 'groupby';
  fields: string[];
  groupApply: ODataApply[];
}

export interface ODataAggregateElement {
  field: string | null;
  aggregationFunction: string;
  name: string;
}

export interface ODataAggregate {
  readonly type: 'aggregate';
  elements: ODataAggregateElement[];
}

export interface ODataFilter {
  value: string;
}

export interface ODataFilterApplication extends ODataFilter {
  readonly type: 'filter';
}

export interface ODataOrderBy {
  field: string;
  mode: 'asc' | 'desc';
}

export type ODataApply = ODataGroupBy | ODataAggregate | ODataFilterApplication;

export interface ODataRequest {
  count?: boolean;
  filter?: ODataFilter;
  orderBy?: ODataOrderBy[];
  skip?: number;
  top?: number;
  select?: string[];
  expand?: ODataExpand;
  apply?: ODataApply[];
  /** Custom values that may be added by ODataExpressionHandlers. */
  customValues?: Record<PropertyKey, unknown>;
}

export type SelectAndExpandRequest = Required<Pick<ODataRequest, 'select' | 'expand'>>;

export interface ODataCountResponse<T = any> {
  [oDataCountField]: number;
  value: T;
}

export const oDataFieldAggregationFunctions: {
  [TContainer in keyof typeof functionContainers]?: { [TMember in keyof (typeof functionContainers)[TContainer]]?: string }
} = {
  Aggregation: {
    maximum: 'max',
    minimum: 'min',
    sum: 'sum',
    average: 'average',
    countDistinct: 'countdistinct'
  }
};

export const oDataDataSetAggregationFunctions: {
  [TContainer in keyof typeof functionContainers]?: { [TMember in keyof (typeof functionContainers)[TContainer]]?: string }
} = {
  Aggregation: {
    count: '$count'
  }
};

export function isODataSerializable(value: unknown): value is ODataSerializable {
  switch (typeof value) {
    case 'string':
    case 'symbol':
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'undefined':
      return true;
    case 'object':
      if (value === null || value instanceof Date) {
        return true;
      }
      if (Array.isArray(value)) {
        return value.every(isODataSerializable);
      }
      return false;
    default:
      return false
  }
}
