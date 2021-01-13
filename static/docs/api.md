## Contents

The following endpoints / entities are implemented or accessible through the SDK:

%TABLE_OF_CONTENTS%

## Special functions

The expose `.raw` function can be used to make a "raw" request to the weclapp api.
For example, instead of using the `.count` function to fetch the total amount of customers you could do:

```ts
const customers = await api.raw('customer/count')
    .then(response => response.result);

console.log(customers);
```

The `raw` function looks like the following:
```
raw(
    endpoint: string;
    options?: {
        method?: Method;
        params?: Record<string, unknown>;
        body?: any;
    }
)
```

## Implementations

Entities are grouped by their name. A function signature always looks like the following: `sdk[entity][function]`.
Each entity implements the following functions (in the following examples we refer to `[Entity]` as being the target-entity):

| Function | Use cases |
| -------- | --------- |
| `some(filter: Partial<[Entity]>)` | Returns all matching entities by the given filter. |
| `create(data: Create[Entity])` | Creates a new entity based on the data. |
| `count(filter?: QueryFilter<[Entity]>)` | Counts the amount of entities matching the given filter (optional). Per default it'll return the total amount. |
| `unique(id: number)` | Returns an entity by it's unique identifier. |
| `update(data: Partial<[Entity]>)` | Updates the given entity. |
| `delete(id: number)` | Deletes an entity by the given id. |

%IMPLEMENTATIONS%
