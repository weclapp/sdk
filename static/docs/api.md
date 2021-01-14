## Contents

The following endpoints / entities are implemented or accessible through the SDK:

1. [Special functions](#special-functions) _- Additional utility functions._
2. [API](#api) _- The core API explained._
3. [Implementations](#implementations):
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
```ts
raw(
    endpoint: string;
    options?: {
        method?: Method;
        params?: Record<string, unknown>;
        body?: any;
    }
)
```

## API

### Functions

Entities are grouped by their name. A function signature always looks like the following: `sdk[entity][function]`.
Each entity implements the following functions (in the following examples we refer to `[Entity]` as being the target-entity):

| Status | Function | Use cases |
| ------ | -------- | --------- |
| Not implemented. | `some(filter: Partial<[Entity]>)` | Returns all matching entities by the given filter. |
| Fully implemented. | `create(data: Create[Entity] & Partial<[Entity]>)` | Creates a new entity based on the data. |
| Fully implemented. | `count(filter?: QueryFilter<[Entity]>)` | Counts the amount of entities matching the given filter (optional). Per default it'll return the total amount. |
| Partial implementation. | `unique(id: string, options: EntityQuery<[Entity]>)` | Returns an entity by it's unique identifier. |
| Not implemented. | `update(data: Partial<[Entity]>)` | Updates the given entity. |
| Fully implemented. | `delete(id: number)` | Deletes an entity by the given id. |


#### `.some`

TBA.

#### `create(data: Create[Entity])`

The `create` function is used to create a new instance of the given entity.
It takes the required data which is mandatory for a new instantiation, including all the possible other properties which can be used to create a new instance of it.

##### Example:

```ts
const article = await sdk.article.create({
    name: 'Flower pot',
    unitId: '108'
});
```

#### `.count(filter?: QueryFilter<[Entity]>)`

The `count` function will return the sum of entities which match the given criteria.

##### Example:

```ts

// Fetch total amount of customers
const customers = await sdk.customer.count();

// Count amount of customers which are not blocked
const activeCustomers = await sdk.customer.count({
    'blocked-eq': false
});
```

#### `.unique(id: string, options: EntityQuery<[Entity]>)`

The `unique` function takes an entity-id and options for how and what should be feched. The options look as follows:

* `serialize` _- If result should be serialized (e.g. non-defined fields nulled)._
* `select` _- Query only these properties, it is highly recommended to always specify what you want._
* `include` _- Experimental, type-less way of fetching additional entities._

##### Example:

```ts

// Fetch id, partyType and birthDate from customer with the id 151662
// Also, serialize the result. In case amountInsured isn't defined, it'll be null in our case.
const customer = await sdk.customer.unique('151662',{
    select: ['id', 'partyType', 'amountInsured'],
    serialize: true
});

// Same as above, but in this case we also want to include the referenced user 
// which is referenced by the responsibleUserId property.
// The return value is now different and is an objec with data, as the entity, and references with
// all the entities resolved by include.
const {data, references} = await sdk.customer.unique('151662',{
    select: ['id', 'partyType', 'amountInsured'],
    serialize: true,
    include: ['responsibleUserId']
});
```

#### `.delete`

The `delete` function simply deletes an entity by it's unique identifier.

##### Example:

```ts
// Return value is 'void' e.g. undefined.
await sdk.article.delete('151662');
```

### Implementations

%IMPLEMENTATIONS%
