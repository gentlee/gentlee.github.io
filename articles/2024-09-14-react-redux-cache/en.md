---
title: '<strong>RRC</strong> - fetch and cache management library for <strong>Zustand/Redux</strong>: [better] <strong>alternative to RTK-Query</strong> and other solutions'
date: '2024-09-14'
cover: 'cover.webp'
cover-alt: 'Example of normalized state'
spoiler: 'Introducing <code>react-redux-cache</code> (RRC) - a lightweight library for data fetching and caching in React applications that supports normalization, unlike React Query and RTK Query, while featuring a similar but much simpler interface. Built for Zustand/Redux, it is fully tested, completely typed, and written in TypeScript.'
links:
- npm: https://www.npmjs.com/package/react-redux-cache
- github: https://github.com/gentlee/react-redux-cache
- discuss-github: https://github.com/gentlee/gentlee.github.io/discussions/2
---

Introducing [react-redux-cache](https://github.com/gentlee/react-redux-cache) (RRC) - a lightweight library for data fetching and caching in React applications that supports normalization, unlike **React Query** and **RTK Query**, while featuring a similar but much simpler interface. Built for Zustand/Redux, it is fully tested, completely typed, and written in TypeScript.

Additionally, unlike **RTK Query**, it easily supports such basic functionality as infinite scrolling with pagination (see example below).

RRC can be considered an ApolloClient for protocols other than GraphQL (though theoretically, it can work with GraphQL as well), but with your own store (Zustand/Redux) — enabling custom selectors (selectors), actions (actions), and reducers, with full control over cached state.

Principles guiding the library's creation:

- Maximum simplicity, minimum restrictions. All essential features are available out-of-the-box, the rest can be implemented as needed.
- High performance.
- High test coverage, 100% type safety, and intolerance for bugs.
- Functional style.
    
## Why?

Below is a comparison with existing libraries for managing requests and state. Why you should use libraries for this instead of writing everything manually with `useEffect`/`redux-saga`, etc., will be left for other articles.

- Full control over the store not only provides more capabilities, simplifies debugging, and coding but also helps avoid **fewer hacks** when a task goes beyond the typical hello-world scenarios from documentation, saving time on struggling with dubious library interfaces and sifting through massive source codes.

- Zustand/Redux are excellent, simple, and proven tools for storing "slow" data — that is, data that does not require updates every frame or every keypress. **Minimal learning curve** for those familiar with the library. The ecosystem provides **convenient debugging tools and numerous ready-made solutions**, such as state persistence (`redux-persist`). It is written in a **functional** style.

- Normalization is the best way to maintain consistent application state across different screens, **reduce the number of requests**, and seamlessly display cached data during navigation, greatly **improving user experience**. Alternatives supporting normalization are scarce — ApolloClient only supports GraphQL and is implemented in a rather questionable, overly complex OOP style.

- **Lightweight**, both in library size and interface — another advantage. The simpler, the better — the main rule for engineers and this library in particular.
    

Quick Comparison of Libraries:

|  |React Query|Apollo Client|RTK-Query|RRC|
|--|--|--|--|--|
|Full access to the store|-|-|+-*|+|
|REST support|+|-|+|+|
|Normalization|-|+|-|+|
|Infinite pagination|+|+|-**|+|
|Not overengineered***|+|-|-|+|
|Popularity|+|+|-****|-|

\* - Lacks actions to manually change the state.

\** - [Yes](https://github.com/reduxjs/redux-toolkit/discussions/1163#discussioncomment-849158), this is the kind of "trash" that RTK-Query is.

\*** - My subjective evaluation, which considers the learning curve, ease of use, and complexity of performing simple tasks such as implementing infinite pagination, persisting data on disk, and other aspects.

\**** - RTK overall has fewer stars compared to other popular libraries, and RTK-Query, being an optional part of it, is even less popular.

#### Why Only React?

Supporting all kinds of UI libraries in addition to the most popular one (which is also used in React Native) would complicate things, and I am not ready for that yet.

## Examples

To run examples from the `/example` folder, use `npm run example`. Three examples are available:

- With normalization (recommended).
- Without normalization.
- Optimized without normalization.

These examples are the best demonstration of how significantly user experience and server load depend on the implementation of client-side caching. In poorly implemented solutions, during any navigation within the application:

- The user is forced to observe spinners and other loading states, being blocked from actions until the loading is complete.
- Requests are constantly sent, even when the existing data is still fresh enough.
    

#### Example of State with Normalization

```javascript
{
  entities: {
    // Each type has its dictionary of entities stored by id
    users: {
      "0": {id: 0, bankId: "0", name: "User 0 *"},
      "1": {id: 1, bankId: "1", name: "User 1 *"},
      "2": {id: 2, bankId: "2", name: "User 2"},
      "3": {id: 3, bankId: "3", name: "User 3"}
    },
    banks: {
      "0": {id: "0", name: "Bank 0"},
      "1": {id: "1", name: "Bank 1"},
      "2": {id: "2", name: "Bank 2"},
      "3": {id: "3", name: "Bank 3"}
    }
  },
  queries: {
    // Each query has its dictionary of states stored by a cache key generated from the query parameters
    getUser: {
      "2": {result: 2, params: 2, expiresAt: 1727217298025},
      "3": {loading: true, params: 3}
    },
    getUsers: {
      // Example of pagination state under a custom cache key (see the pagination section below)
      "all-pages": {
        result: {items: [0,1,2], page: 1},
        params: {page: 1}
      }
    }
  },
  mutations: {
    // Each mutation also has its state
    updateUser: {
      result: 1,
      params: {id: 1, name: "User 1 *"}
    } 
  }
}

```

#### Example of State Without Normalization

```javascript
{
  // The dictionary of entities is only used for normalization, and here it is empty
  entities: {},
  queries: {
    // Each query has its dictionary of states stored by a cache key generated from the query parameters
    getUser: {
      "2": {
        result: {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"},
        params: 2,
        expiresAt: 1727217298025
      },
      "3": {loading: true, params: 3}
    },
    getUsers: {
      // Example of pagination state under a custom cache key (see the pagination section below)
      "all-pages": {
        result: {
          items: [
            {id: 0, bank: {id: "0", name: "Bank 0"}, name: "User 0 *"},
            {id: 1, bank: {id: "1", name: "Bank 1"}, name: "User 1 *"},
            {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"}
          ],
          page: 1
        },
        params: {page: 1}
      }
    }
  },
  mutations: {
    // Each mutation also has its state
    updateUser: {
      result: {id: 1, bank: {id: "1", name: "Bank 1"}, name: "User 1 *"},
      params: {id: 1, name: "User 1 *"}
    } 
  }
}
```

### Installation

`react`, `redux`, and `react-redux` are peer dependencies.

`fast-deep-equal` is an optional peer dependency if deep comparison is needed for optimizing re-renders (`deepComparisonEnabled`, default is `true`).

```bash
npm add react-redux-cache react redux react-redux fast-deep-equal
```

### Initialization

The only function you need to import is `createCache`, which creates fully typed reducers, hooks, actions, selectors, and utilities for use in your application. You can create as many caches as needed, but note that normalization is not shared between them. All types, queries, and mutations must be passed during cache initialization for correct typing.

#### `cache.ts`

```typescript
// Mapping normalized entities to their types
// Not needed if normalization is unnecessary, simply import `createCache` instead of `withTypenames`
export type CacheTypenames = {
  users: User // `users` entities will have the type `User`
  banks: Bank
}

export const {
  cache,
  reducer,
  hooks: {useClient, useMutation, useQuery},
} = withTypenames<CacheTypenames>().createCache({
  // Used as a prefix for actions and in the selector to choose the cache state from the root state
  name: 'cache',
  queries: {
    getUsers: { query: getUsers },
    getUser: {
      query: getUser,
      secondsToLive: 5 * 60, // Here, the cache is valid for 5 minutes
    },
  },
  mutations: {
    updateUser: { mutation: updateUser },
    removeUser: { mutation: removeUser },
  },
})
```

### Requirements for Normalization

To use normalization, two things are required:

1. Specify `typenames` when creating the cache — a list of all entities and their corresponding TypeScript types.
2. Ensure that the functions for queries or mutations return an object that, in addition to the `result` field, includes data of the following type:

```typescript
type EntityChanges<T extends Typenames> = {
  // Entities to be merged with the existing ones in the cache
  merge?: PartialEntitiesMap<T>
  // Entities to replace the existing ones in the cache
  replace?: Partial<EntitiesMap<T>>
  // Identifiers of entities to be removed from the cache
  remove?: EntityIds<T>
  // Alias for `merge` to support the `normalizr` library
  entities?: EntityChanges<T>['merge']
}
```

#### `store.ts` (Redux)

Create the Redux store as usual, passing the new cache reducer under the name of the cache. If a different Redux structure is needed, you should additionally pass a selector for the cache state when creating the cache.

```typescript
const store = configureStore({
  reducer: {
    [cache.name]: reducer,
    ...
  }
})
```

#### `api.ts`

The result type of a query should be `NormalizedQueryResponse` or `QueryResponse`, and for a mutation — `NormalizedMutationResponse` or `MutationResponse`. In this example, the `normalizr` package is used for normalization, but other tools can be used if the query result conforms to the required type. Ideally, the backend returns already normalized data.

Regarding race conditions:

- For queries, throttling is used — while a query with certain parameters is in progress, subsequent ones with the same parameters are canceled.
- For mutations, debouncing is used — each subsequent mutation cancels the previous one if it has not yet completed. For this, an `abortController.signal` is passed as the second parameter in the mutation.

```typescript
// Example of a query with normalization (recommended)

export const getUser = async (id: number) => {
  const result = await ...

  const normalizedResult: {
    // result - user ID
    result: number
    // entities contain all normalized entities
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUserSchema)

  return normalizedResult
}

// Example of a query without normalization

export const getBank = (id: string) => {
  const result: Bank = ...
  return {result}
}

// Example of a mutation with normalization

export const removeUser = async (id: number, abortSignal: AbortSignal) => {
  await ...
  return {
    remove: { users: [id] }, // `result` is not set, but the user ID to be removed from the cache is specified
  }
}
```

#### `UserScreen.tsx`

```typescript
export const UserScreen = () => {
  const {id} = useParams()

  // `useQuery` connects to the store's state, and if a user with such an ID is already cached,
  // the query will not be executed (default caching policy is 'cache-first')
  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    params: Number(id),
  });

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  // This hook returns entities with the correct types — User and Bank
  const user = useSelectEntityById(userId, 'users');
  const bank = useSelectEntityById(user?.bankId, 'banks');

  if (loading) {
    return ...
  }

  return ...
}
```

### Advanced Features

#### Infinite Scrolling with Pagination

Here’s an example of configuring the `getUsers` query to support infinite scrolling — a feature unavailable in RTK-Query. The full implementation can be found in the `/example` folder.

```typescript
// createCache

...
} = createCache({
  ...
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages', // A single cache key is used for all pages
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          return {
            ...newResult,
            items: [...oldResult.items, ...newResult.items],
          }
        }
        return oldResult
      },
    },
  },
  ...
})

// Component

export const GetUsersScreen = () => {
  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: 1 // page
  })

  const refreshing = loading && params === 1
  const loadingNextPage = loading && !refreshing

  const onRefresh = () => fetchUsers();

  const onLoadNextPage = () => {
    const lastLoadedPage = usersResult?.page ?? 0;
    fetchUsers({
      query: 'getUsers',
      params: lastLoadedPage + 1,
    })
  }

  const renderUser = (userId: number) => (
    <UserRow key={userId} userId={userId} />
  )

  return (
    <div>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map(renderUser)}
      <button onClick={onRefresh}>Refresh</button>
      {loadingNextPage ? (
        <div className="spinner" />
      ) : (
        <button onClick={onLoadNextPage}>Load next page</button>
      )}
    </div>
  )
}
```

#### redux-persist

Here’s a simple configuration for `redux-persist`:

```typescript
// Removes `loading` and `error` from the persisted state
function stringifyReplacer(key: string, value: unknown) {
  return key === 'loading' || key === 'error' ? undefined : value
}

const persistedReducer = persistReducer(
  {
    key: 'cache',
    storage,
    whitelist: ['entities', 'queries'], // Mutation state is not saved
    throttle: 1000, // ms
    serialize: (value: unknown) => JSON.stringify(value, stringifyReplacer),
  },
  cacheReducer
)
```

Other usage examples can be found in the [documentation](https://github.com/gentlee/react-redux-cache).

### Conclusion

Although the project is still under development, it is ready for use. Constructive criticism and qualified contributions are welcome.
