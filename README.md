# ts-flex-query

Define flexible and type-safe data queries and execute them against in-memory JS data (arrays and objects), an OData endpoint or an arbitrary data source using a custom query executor.

## Theory

_ts-flex-query_ is based on the following basic concepts:

- An _expression_ is a specification of how to calculate a value. An expression can be _evaluated_ to the resulting value.

  Example of an atomic expression: "The value 42." It evaluates to 42.

  Example of a composite expression: "Filter the list of numbers [1, 4, 7] for those greater than 5." It evaluates to the list [7].

- A _query_ is a specification of operations to be applied to an input expression. The type of the value the input expression evaluates to is (partially) known at the time of specifying a query, but the input expression itself and the value it evaluates to are not.

  Abstract example of a query: "Filter the input, an array of strings, for those whose length is greater than 5."

- Applying a _query_ to an input _expression_ yields another _expression_.

## Getting started

### From the query to the result

The following steps will guide you from query specification over using the query result type to receiving the result:

1. Specify the query (see [Creating queries](#creating-queries)).
    ```TS
    import { QueryFactory } from 'ts-flex-query';

    const query = new QueryFactory<Node[]>().create(
      // ...
    );
    ```
    Prerequisite: You have TypeScript types (Node in this example) describing your data model, including both atomic fields and navigation and collection properties.
1. Define the query result type and work with it in your code, e.g., to convert the query result received from a server to a view model:
    ```TS
    import { EvaluatedQueryType } from 'ts-flex-query/types';

    type ResultType = EvaluatedQueryType<typeof query>;

    function convertToViewModel(serverData: ResultType): ViewModel {
      // Convert serverData to ViewModel.
    }
    ```
1. Evaluate the query (see [Evaluating queries](#evaluating-queries)) and hand the result over to your business logic code, e.g., the `convertToViewModel` function above.

These steps ensure that the whole process of specifying the data to receiving and working with that data is type-safe.

### Creating queries

Queries are basically composed of pipe operators (`PipeOperator<TIn, TOut>`). There is a bunch of predefined pipe operators (see examples below and [Operator reference](#operator-reference)), but you can also specify your own operators.

Whenever you need to create a new query, use the `QueryFactory<T>.create` method. It accepts the type parameter `T`, which is the type of the input value, and up to nine pipe operators to be applied in sequence to the input. (This method is conceptually similar to RxJs's `Observable.pipe` method.)

The type of a query is `PipeOperator<TIn, TOut>`. Therefore, a query created with `createQuery` can be used as operator again.

#### Examples of query specifications

1. Use the `filter` operator to filter an input collection:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field, filter, func, value } from 'ts-flex-query/operators';

    const filterQuery = new QueryFactory<Node[]>().create(
      filter(func('equal', field('Id'), value(42)))
    );
    ```

    Besides *equal*, various other functions such as *greater*, *lower* and *contains* can be used with the func operator.
    To combine multiple conditions, you can use one of the boolean operators *and*, *or*, and *not*, e.g.:
    ```TS
    const filterQuery2 = new QueryFactory<Node[]>().create(
      filter(and(
        func('greaterOrEqual', field('Id'), value(10)),
        func('notEqual', field('Name'), value(null))
      ))
    );
    ```

1. Use the `orderBy` operator to sort the items of a collection:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { orderBy } from 'ts-flex-query/operators';

    const orderQuery = new QueryFactory<Node[]>().create(
      orderBy(
        ['Name', 'desc'], // first by Name descending
        chain('MasterNode', 'Id'), // then by MasterNode.Id ascending
        'Id' // then by Id ascending
      )
    );
    ```

1. Use the `field` operator to map an input object to a field:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field } from 'ts-flex-query/operators';

    const fieldQuery = new QueryFactory<Node>().create(
      field('Name') // compile error if Node does not have a field 'Name'
    );
    ```

    To access a nested field, you can either pipe multiple `field` operators or use the `chain` operator:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { chain, field } from 'ts-flex-query/operators';

    const fieldQuery2 = new QueryFactory<Node>().create(
      // field('MasterNode'), field('Id')
      // or equivalently:
      chain('MasterNode', 'Id')
    );
    ```

1. Use the `pipe` operator to apply multiple operators in sequence where the signature allows only one operator:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { field, orderBy, pipe } from 'ts-flex-query/operators';

    const orderQuery2 = new QueryFactory<Node[]>().create(
      orderBy(
        pipe(field('MasterNode'), field('Id')) // Order by MasterNode.Id.
        // equivalent to:
        // chain('MasterNode', 'Id')
      )
    );
    ```

1. Use the `querySchema` operator to select parts of an object tree:
    ```TS
    import { pipeExpression, QueryFactory } from 'ts-flex-query';
    import { orderBy, querySchema, slice } from 'ts-flex-query/operators';
    import { EvaluatedQueryType } from 'ts-flex-query/types/evaluated-result-type';

    const querySchemaQuery = new QueryFactory<Node[]>().create(
      querySchema([{ // A collection schema is an array with one object schema element.
        Id: true, // Pick the primitive field 'Id'.
        MasterNode: { // Define a sub object schema for the field 'MasterNode'.
          Id: true // Pick MasterNode's primitive field 'Id'.
        },
        AlternativeMasterNode: 'expand', // Pick all primitive fields of the sub object 'AlternativeMasterNode'.
        MainFacility: 'select', // Like 'expand', but when used with the ODataExecutor, this field will be included only in the $select clause, not in the $expand clause.
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
    ```

    This will result in the following query result type (where `PickPrimitiveFields<T>` is a helper type which removes all non-primitive fields from `T`):
    ```TS
    {
      Id: number;
      MasterNode: {
          Id: number;
      };
      AlternativeMasterNode: PickPrimitiveFields<MasterNode>;
      Facilities: {
          BusinessId: number;
      }[];
      AlternativeFacilities: PickPrimitiveFields<Facility>[];
      Providers: {
          Id: number;
      }[];
    }[]
    ```

1. Use the `record` operator to create records with custom fields and values:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { chain, field, first, map, orderBy, pipe, record } from 'ts-flex-query/operators';

    const recordQuery = new QueryFactory<Node[]>().create(
      map(record({
        id: 'Id',
        masterNodeId: chain('MasterNode', 'Id'), // MasterNode.Id
        firstProviderId: pipe(field('Providers'), orderBy('BusinessId'), first(), field('Id')) // first provider's (when ordered by BusinessId) Id
      }))
    );
    ```

1. Use the `groupAndAggregate` operator to group by a record value and optionally merge aggregation values into this result record:
    ```TS
    import { QueryFactory } from 'ts-flex-query';
    import { funcs } from 'ts-flex-query/expressions';
    import { aggregateValue, groupAndAggregate } from 'ts-flex-query/operators';

    const groupAndAggregateQuery = new QueryFactory<Node[]>().create(
      groupAndAggregate({
        MasterNode: { Id: true }
      }, {
        count: funcs.count,
        minId: aggregateValue('Id', funcs.minimum)
      })
    );
    ```
    The result type will be:
    ```TS
    {
        MasterNode: { // This is the group key identifying the group.
            Id: number;
        };
        count: number; // Aggregation value.
        minId: number | undefined; // Aggregation value.
    }[]
    ```

    You can also use `groupAndAggregate` to aggregate over all entries in an OData-compatible way:
    ```TS
    const groupAndAggregateQueryForCount = new QueryFactory<Node[]>().create(
      groupAndAggregate({}, {
        count: funcs.count // Get the number of all items.
      })
    );
    ```
    The result will be an array with exactly one group (the group representing all elements). The result type will be:
    ```TS
    {
        count: number; // Aggregation value.
    }[]
    ```

> NOTE: In general, the order of operators in a query matters. Even if semantically equivalent, another operator order might affect performance. The following rules should be obeyed in this regard:
> * *Filter early*: The `filter` operator reduces the number of elements. Therefore, it should be applied as early as possible in the pipeline and particularly before sorting.
> * *Expand late*: The `querySchema` and also the `record` operator should be applied as late as possible in the pipeline because all fields in the resulting records may be evaluated in the backend before further operators are applied.

### Evaluating queries

Two steps are required to evaluate a query against an input:

1. Apply the query to an input expression thereby yielding a self-contained evluatable expression:
    ```TS
    import { pipeExpression } from 'ts-flex-query';
    const expr = pipeExpression(input, query);
    ```
    The type of the `input` expression depends on the evaluator to be used (see below).
2. Evaluate the expression using an evaluator (see below).

#### The JS evaluator

All (non-custom) queries are evaluatable using the implicitly available JS evaluator. You can use it like this:

```TS
import { evaluateExpression, pipeExpression } from 'ts-flex-query';
import { constant } from 'ts-flex-query/expressions';

const listOfNodes: Node[] = /* Your data goes here. */;
const expr = pipeExpression(constant(listOfNodes), query);
const result = evaluateExpression(expr);
// Work with the result.
```

The JS evaluator requires a `constant` expression to be used as input to your query.

#### The OData evaluator

```TS
// 1. Apply the query to an oDataCollection input expression:
const expr = pipeExpression(oDataCollection<Node>('Nodes'), query);

// 2. Evaluate the query:
const evaluator = new ODataExecutor((collectionName, queryText) => {
  // Go to your OData endpoint here using collectionName and queryText and return an Observable of the raw OData result.
});
evaluator.execute(expr).subscribe((result) => {
  // Work with the result.
});
```

You may want to create a singleton instance of the `ODataExecutor` and re-use it for multiple queries. In the function provided to the `ODataExecutor` constructor, use an HTTP client of your choice to contact your OData endpoint. Build the URL from the provided parameters `collectionName` and `queryText` (which does not contain the questionmark "?").

> NOTE: Not all expressions and operators are compatible with the OData evaluator. Particularly, have a look at the "OData-compatible" column in the section [Operator reference](#operator-reference).

#### Custom evaluators

It is possible to define custom evaluators. Typically, an evaluator definition also comes with a special type of input expression to which a query can be applied (similarly to the `oDataCollection` expression for the OData evaluator).

Requirements a custom evaluator must fulfill:
* It takes an expression and evaluates it according to the semantics of the expression and the expressions nested therein. It must be able to cope with all expression types assignable to `FrameworkExpression` and the special input expression type defined for that evaluator. It must throw an error when detecting unknown expression types.
* The type of the result value must be assignable to `EvaluatedResultType<T>` where `T` is the generic type parameter of the evaluated expression.
* The result may be provided either synchronously or asychronously as `Observable<EvaluatedResultType<T>>` or `Promise<EvaluatedResultType<T>>`.

## Migrating from mm-query

ts-flex-query is the successor library of mm-query, which is no longer supported.

This section gives some examples on how to migrate specific constructs of mm-query to those of ts-flex-query.

1. Migrate ```queryCollection``` to the ```QueryFactory```:
    ```TS
    // mm-query:
    const query = queryCollection<Node>()
      .pick/orderBy/filter/...

    // ts-flex-query:
    const query = new QueryFactory<Node[]>().create(
      ...
    );
    ```
    Note that, in order to use a collection input, the generic type argument of ```QueryFactory``` must be an array, whereas the type argument of ```queryCollection``` was not an array.

1. Migrate filters:
    ```TS
    // mm-query:
    const q1 = queryCollection<TestData>().filter(b => b.equal('field1', 42));
    const q2 = queryCollection<TestData>().filter(b => b.and(
      b2 => b2.equal('field1', 42),
      b2 => b2.equal('field2', 'xyz'))
    );
    const q3 = const q = queryCollection<TestData>().filter(b => b.equal(
      h => h.chain(c => c.select('field4').select('f1')),
      h => h.constant(42)
    ));

    // ts-flex-query:
    const q1 = new QueryFactory<TestData[]>().create(
      filter(func('equal', field('field1'), value(42)))
    );
    const q2 = new QueryFactory<TestData[]>().create(
      filter(and(
        func('equal', field('field1'), value(42)),
        func('equal', field('field2'), value('xyz'))
      ))
    );
    const q3 = new QueryFactory<TestData[]>().create(
      filter(func('equal', chain('field4', 'f1'), value(42)))
    );
    ```

1. Migrate sorting:
    ```TS
    // mm-query:
    const q = queryCollection<TestData>().orderBy('field2').orderBy('field3', false);

    // ts-flex-query:
    const q = new QueryFactory<TestData[]>().create(
      orderBy('field2', ['field3', 'desc'])
    );
    ```

1. Migrate grouping:
    ```TS
    // mm-query:
    const q = queryCollection<TestData>()
      .groupBy('field2')
      .groupBy('field3')
      .aggregate(NumberFieldAggregationFunction.sum, 'field1Sum', 'field1');

    // ts-flex-query:
    const q = new QueryFactory<TestData[]>().create(
      groupAndAggregate({
        field2: true,
        field3: true
      }, {
        field1Sum: aggregateValue('field1', funcs.sum)
      })
    );
    ```

1. Migrate ```pick```, ```expand```, and ```query``` to the ```querySchema``` operator:
    ```TS
    // mm-query:
    const q1 = queryCollection<TestData>().pick('field1').expand('field4').query('field5');
    const q2 = queryCollection<TestData>()
      .expand('field4', q2 => q2.pick('f2').pick('f3'))
      .query('field5', q2 => q2.pick('f2').pick('f3'));
    const q3 = queryCollection<TestData>()
      .query('f5', f5 => f5
        .filter(b => b.equal('field3', true))
        .skip(3)
        .top(1)
        .pick('field2')))));

    // ts-flex-query:
    const q1 = new QueryFactory<TestData[]>().create(
      querySchema([{
        field1: true,
        field4: 'expand', // All atomic fields of object field4.
        field5: ['expand'] // All atomic fields of the objects in collection field5.
      }])
    );
    const q2 = new QueryFactory<TestData[]>().create(
      querySchema([{
        field4: { f2: true, f3: true },
        field5: [{ f2: true, f3: true }]
      }])
    );
    const q3 = new QueryFactory<TestData[]>().create(
      querySchema([{
        f5: (objs) => pipeExpression(
          objs,
          filter(func('equal', field('field3'), value(true))),
          slice(3, 1),
          querySchema([{ field2: true }])
        )
      }])
    );
    ```

1. Migrate determining the query result type:
    ```TS
    // mm-query:
    type MyQueryResultType = QueryResult<typeof q>;

    // ts-flex-query:
    type MyQueryResultType = EvaluatedQueryType<typeof q>;
    ```

1. Migrate executing OData queries:
    ```TS
    // mm-query:
    const q = queryCollection<TestData>()...; // Create the query.
    const executor = new MyODataExecutor(); // Your class extending the ODataQueryExecutor.
    const result = await executor.executeQuery(q).toPromise();
    // Work with the result.

    // ts-flex-query:
    const q = new QueryFactory<TestData[]>().create(...); // Create the query.
    const expr = pipeExpresssion(oDataCollection('...'), q); // Define the OData collection the query should be applied to.
    const executor = new ODataExecutor(...); // Instantiate the ODataExecutor according to the section "The OData evaluator".
    evaluator.execute(expr).subscribe((result) => {
      // Work with the result.
    });
    ```

## Operator reference

| Name              | Description                                                                                                 | OData-compatible |
|-------------------|-------------------------------------------------------------------------------------------------------------|------------------|
| aggregateValue    | Aggregate a selected value of the input elements using a specified function.                                | ???                |
| and, or, not      | Boolean operators                                                                                           | ???                |
| apply             | Apply a function to the input expression yielding another expression.                                       |                  |
| chain             | Access a nested field.                                                                                      | ???                |
| customFunc        | Apply a custom value-level function.                                                                        |                  |
| expression        | Ignore the input and switch to the provided expression.                                                     |                  |
| field             | Map the input object to the value of one of its fields.                                                     | ???                |
| filter            | Filter a collection based on a predicate.                                                                   | ???                |
| first             | Extract the first element of a collection.                                                                  |                  |
| flatMap           | Map each element of the input array to a collection and flatten the result.                                 |                  |
| func              | Apply a predefined value-level function.                                                                    | ???                |
| groupAndAggregate | Group the collection elements and optionally merge the group key record with calculated aggregation values. | ???                |
| groupBy           | Group collection elements.                                                                                  |                  |
| includeCount      | Create a record with a count field and an elements field.                                                   | ???                |
| letIn             | Save the input before continuing with further steps for better performance.                                 | ???                |
| map               | Map each element of the input collection to another value.                                                  | ???                |
| merge             | Recursively merge two records.                                                                              |                  |
| noOp              | No operation. Return the input as-is.                                                                       | ???                |
| orderBy           | Sort the collection elements by provided criteria.                                                          | ???                |
| pipe              | Apply multiple operators.                                                                                   |                  |
| querySchema       | Select parts of an object tree.                                                                             | ???                |
| record            | Specify a record.                                                                                           |                  |
| slice             | Skip and take elements from the input collection.                                                           | ???                |
| value             | Ignore the input and return the provided value.                                                             | ???                |
