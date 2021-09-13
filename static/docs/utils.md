## Contents

All utilities are available under `@weclapp/sdk/utils`.
They're mostly used internally but can also be used outside the SDK.

* [Resolver](#resolver) _- Resolve primary contacts / addresses._
* [Params](#params) _- Build URL search parameters from an object._
* [Unwrap](#unwrap) _- Unwrap a weclapp's API response._
* [FlattenSelectable](#flattenselectable) _- Flatten a selectable payload._
* [FlattenFilterable](#flattenfilterable) _- Flatten a filterable payload._
* [FlattenSortable](#flattenSortable) _- Flatten a sortable payload._

### Resolver

```ts
import {resolvePrimaryAddress, resolvePrimaryContact} from '@weclapp/sdk/utils';
import {Address, Contact} from '@sdk';

// Customer can also be a lead / party entity.
// It only expects a primary[Contact|Address]Id to resolve both, hence we have to pass in 
// a type we expect in return.
const primaryAddress = resolvePrimaryAddress<Address>(customer);
const primaryContact = resolvePrimaryContact<Contact>(customer);
```

### Params

```ts
import {params} from '@weclapp/sdk/utils';

const queryString = params('/user', {
    id: 25,
    age: 90,
    firstName: null,
    lastName: undefined
});

// queryString === /user?id=25&age=90&firstName=null
```


### Unwrap

Responses from weclapp are usually wrapped in a `{result: <data>}` object.
`unwrap` can be used to extract the data in a convenient way (e.g. in a `.then` block).

```ts
import {unwrap} from '@weclapp/sdk/utils';
import {Customer} from '@sdk';

const data = unwrap<Customer>(response);
// `data` is now the customer.
```

### FlattenSelectable

This one is usually used to transform the object passed to `select` into a URL.

```ts
import {flattenSelectable} from '@weclapp/utils';

const selectable = flattenSelectable<{
    id: number;
    contact: {
        firstName: string;
        lastName: string;
    }
}>({
    id: true,
    contact: {
        firstName: true
    }
});

// `selectable` is ['id', 'contact.firstName']
```

### FlattenFilterable

This one is usually used to transform the object passed to `select` into a URL.

```ts
import {flattenFilterable} from '@weclapp/utils';

const selectable = flattenFilterable<{
    id: number;
    contact: {
        firstName: string;
        lastName: string;
    }
}>({
    id: {EQ: 100},
    contact: {
        firstName: {NOT_IN: ['Foo', 'Bar']}
    }
});

// `selectable` is a map:
//   Map(2) { 'id-eq' => '100', 'contact.firstName-notin' => '[Foo,Bar]' }
```

> For a list with all available filters (like EQ and NOT_IN) see [api#filters](api.md#filters).


### FlattenSortable

This one is used to sort the api result for specified properties in ascending or descending order.
The order of the passed in values is relevant.
First input has the highest sort priority, all subsequent inputs are defining the subsequent order.

```ts
import {flattenSortable} from '@weclapp/utils';

const sortable = flattenSortable<{
    id: string;
    createdDate: number;
}>({
    id: 'asc',
    createdDate: 'desc'
});

// `sortable` is ['id', '-createdDate']
```

### Custom attributes

This SDK also comes with utilities to manage custom attributes.

```ts
import {getCustomAttribute, upsertCustomAttribute} from '@sdk/utils';

// Extracts a custom attribute by it's ID.
// This utility is rather error-resistant as most properties are optional - null is returned if it wasn't possible to extract the given attribute.
const attribute = getCustomAttribute({
    customAttributes: [
        {attributeDefinitionId: '2165', numberValue: 123}
    ]
}, '2165'); // Holds {attributeDefinitionId: '2165', numberValue: 123}

// Creates or updates the custom attribute of an entity.
const entity = {
    customAttributes: [
        {attributeDefinitionId: '2165', numberValue: 123},
        {attributeDefinitionId: '4644', stringValue: 'Hello world'},
        {attributeDefinitionId: '3490', booleanValue: true}
    ]
};

upsertCustomAttribute(entity, '21265', 'numberValue', 456);
// Custom-attribute with 2165 now yields 456 as number-value
```