# Patterns of expressions supported by RequestBuilder.build

## MapExpression: applyMap

### Input GroupExpression: applyGroup

> $apply=groupby((x))
```
Map
    input: Group
        variableSymbol: s_group
        value: If
            condition: <s_group> is undefined
            then: <s_group>
            else: Record
                fields:
                    x: Field
                    ...
        input: <Input>
    body: Field
        field: Group.groupValueField
```

> $apply=groupby((x),aggregate(y with max as maxY))
```
Map
    input: Group
        variableSymbol: s_group
        value: If
            condition: <s_group> is undefined
            then: <s_group>
            else: Record
                fields: ...
        input: <Input>
    body: Merge
        record1: Field
            field: Group.groupValueField
        record2: Record
            fields:
                maxY: FunctionApplication
                    member: 'maximum'
                    arg1: Map
                        input: Field
                            field: Group.elementsField
                        body: Field
                            input: Map.variable
                            field: 'y'
```

> $apply=aggregate(y with max as maxY)
```
Map
    input: Group
        value: Record
            fields: {}
        input: <Input>
    body: Merge
        record1: Field
            field: Group.groupValueField
        record2: Record
            fields:
                maxY: FunctionApplication
                    member: 'maximum'
                    arg1: Map
                        input: Field
                            field: Group.elementsField
                        body: Field
                            input: Map.variable
                            field: 'y'
```

# The include-count patterns supported by RequestBuilder.buildWithPossibleIncludeCount

```
Let
    input: <Input>
    body: Record
        fields:
            <elements>: <Expr>
                ... Let.variable
            <count>: FunctionApplication
                member: 'count'
                arg1: Let.variable
```
