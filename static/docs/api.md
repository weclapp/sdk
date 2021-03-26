## Contents

The following endpoints / entities are implemented or accessible through the SDK:

1. [Special functions](#special-functions) _- Additional utility functions._
2. [API](#api) _- The core API explained._
3. [Implementations](#implementations):
   %TABLE_OF_CONTENTS%

## Special functions

The expose `.raw` function can be used to make a "raw" request to the weclapp api. Utility functions come in handy here. For example, instead of using
the `.count` function to fetch the total amount of customers you could do:

```ts
import {WeclappResponse} from '@weclapp/sdk';
import {unwrap} from '@weclapp/sdk/utils';

const customers = await sdk.raw<WeclappResponse<number>>('/customer/count')
    .then(unwrap);

console.log(customers);
```

The `raw` function looks like the following:

```
raw(
    endpoint: string;
    options?: {
        method?: Method;
        query?: Record<string, unknown>;
        headers?: Record<string, string>;
        body?: any;
    }
)
```

> If you need to send binary data, e.g. documents, use [`Buffer`](https://nodejs.org/docs/latest-v14.x/api/buffer.html) in node or 
> [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) in the browser.

## API

### Functions

Entities are grouped by their name. A function signature always looks like the following: `sdk[entity][function]`. Each entity implements the following
functions (in the following examples we refer to `[Entity]` as being the target-entity, the function signatures are simplified):

| Status | Function | Description |
| ------ | -------- | ----------- |
| Fully implemented. | `count(filter?: QueryFilter<[Entity]>)` | Counts the amount of entities matching the given filter (optional). Per default it'll return the total amount. |
| Partial implementation. | `unique(id: string, options?: EntityQuery<[Entity]>)` | Returns an entity by it's unique identifier. |
| Partial implementation. | `some(options?: ListQuery<[Entity]>)` | Returns all matching entities by the given filter. |
| Partial implementation. | `first(options?: FirstQuery<[Entity]>)` | Returns the first matching entity. |
| Fully implemented. | `create(data: Create[Entity] & Partial<[Entity]>)` | Creates a new entity based on the data. |
| Partial implementation. | `update(data: Partial<[Entity]>)` | Updates the given entity with a sub-set of itself. |
| Fully implemented. | `replace(id: string, data: [Entity]>)` | Replaces the given entity with the new one.  |
| Fully implemented. | `delete(id: number)` | Deletes an entity by the given id. |

> "Partial implementation" refers to types missing or not properly resolve return type.

The `EntityQuery` and `FirstQuery` comes with the following options:

* `serialize` _- If result should be serialized (e.g. non-defined fields nullable)._
* `select` _- Query only these properties, it is highly recommended to always specify what you want - it'll lower the response time greatly._
* `include` _- Experimental, type-less way of fetching additional entities._
* `filter` _- Query only entities which match the given criteria._

The extended version, `ListQuery` also concludes:

* `page` _- The amount of entities to return per page._
* `pageSize` _- The page size._

##### Filters:

Using the `filter` property certain entities can be excluded from the set:

| Comparator | Meaning | Description |
| ---------- | ------- | ----------- |
| `EQ` | Equal | Checks if something is equal something. |
| `NE` | Not equal | Checks if something is _not_ equal something. |
| `LT` | Less than | Checks if the entity's value is less than something. |
| `GT` | Greater than | Checks if the entity's value is greater than something. |
| `LE` | Less or equal than | Checks if the entity's value is less or equal than / to something. |
| `GE` | Greater or equal than | Checks if the entity's value is greater or equal than / to something. |
| `LIKE` | Like expression | Checks if the entity's value is like another string (supports % and _ as placeholders, similar to SQL's `LIKE` operator). |
| `ILIKE` | Ignore-case like | Same as `like` but case-insensitive. |
| `IN` | Set | Checks if the entity's value is in a list. |

> Prefixing `LIKE`, `ILIKE` and `IN` with a `NOT_` negates the condition.

Example with multiple filters:

```json5
{
    username: {LIKE: '%simon'},
    age: {GT: 20},
    email: {NE: null},
    firstName: {NOT_IN: ['sven', 'julius']}
}
```

It is possible to use _one_ OR condition at the very root of your query:

```json5

{
   OR: [
      {username: {EQ: 'John'}},
      {age: {GT: 50}},
      {email: {EQ: null}}
   ]
}
```

> It is not possible to use operators in reverse, e.g. {LIKE: {username: '...'}}!

#### `.count(filter?: QueryFilter<[Entity]>)`

The `count` function will return the sum of entities which match the given criteria.

##### Example:

```ts

// Fetch total amount of customers
const customers = await sdk.customer.count();

// Count amount of customers which are not blocked and the 
// customerId is greater than 50
const activeCustomers = await sdk.customer.count({
    blocked: {eq: false},
    customerId: {gt: 50}
});
```

#### `.unique(id: string, options: EntityQuery<[Entity]>)`

The `unique` function takes an entity-id and options for how and what should be fetched.

##### Example:

```ts

// Fetch id, partyType and birthDate from customer with the id 151662
// Also, serialize the result. In case amountInsured isn't defined, it'll be null in our case.
const customer = await sdk.customer.unique('151662', {
    select: {id: true, partyType: true, amountInsured: true},
    serialize: true
});

// Same as above, but in this case we also want to include the referenced user 
// which is referenced by the responsibleUserId property.
// The return value is now different and is an objec with data, as the entity, and references with
// all the entities resolved by include.
const {data, references} = await sdk.customer.unique('151662', {
    select: {id: true, partyType: true, amountInsured: true},
    serialize: true,
    include: ['responsibleUserId']
});
```

To query nested properties, you can pass an object to `select`:

```ts
// Fetches the customer with the id 151662
// Selects id, blocked and salesPartner from the customer itself and
// id, firstName and lastName from each contact.
const customer = await sdk.customer.unique('151662', {
    select: {
        id: true,
        blocked: true,
        salesPartner: true,
        contacts: { // You can also just pass `true` to get the entire contacts object
            id: true,
            firstName: true,
            lastName: true
        }
    }
});
```

#### `.some(options?: ListQuery<[Entity]>)`

Fetches a list of the given entity.

##### Example:

```ts

// Fetches the second page of articles with 5 items.
// Queries the id, the partyType and the birthDate
// Serializes the result, e.g. sets `null` for optional, possibly not defined fields.
const articles = await sdk.article.some({
    select: {id: true, partyType: true, birthDate: true},
    serialize: true,
    pageSize: 5,
    page: 2
});

// Same as above, but without serialization and resolving the responsible user.
// data will be a list of articles and references an object with possible
// references.
const {data, references} = await sdk.article.some({
    select: {id: true, partyType: true, birthDate: true},
    include: ['responsibleUserId']
});
```

#### `.first(options?: FirstQuery<[Entity]>)`

Fetches the first entity from the first page, ignoring all the other results. All options from `some` can be used except for the pagination options.

##### Example:

```ts

// Fetches the first customer it can find
const customer = await sdk.customer.first();
```

#### `.create(data: Create[Entity])`

The `create` function is used to create a new instance of the given entity. It takes the required data which is mandatory for a new instantiation, including all
the possible other properties which can be used to create a new instance of it.

##### Example:

```ts
const article = await sdk.article.create({
    name: 'Flower pot',
    unitId: '108'
});
```

#### `.update(id: string, data: Partial<[Entity]>)`

The `update` functoin can be used to update a specific instance of an entity using the given id.

##### Example:

```ts
// Return value is the freshly updated customer
const customer = await sdk.customer.update('176662', {
    company: 'Hello world LLC'
});
```

#### `.replace(id: string, data: [Entity])`

The `replace` replaces the entity identified by the given id with the new one. This is useful if the customer has already been fetched, and the integrity needs
to be preserved if multiple users are editing the same entity.

##### Example:

```ts

// Fetch first customer it can find
const customer = await sdk.customer.first();

// Update customer 
const updated = await sdk.customer.replace(customer.id, {
    ...customer,
    company: 'Hello world LLC'
});
```

#### `.delete(id: string)`

The `delete` function simply deletes an entity by it's unique identifier.

##### Example:

```ts
// Return value is 'void' e.g. undefined.
await sdk.article.delete('151662');
```

### Implementations

> The `signature` is simplified and is just there to get the gist of what it expects!

%IMPLEMENTATIONS%
