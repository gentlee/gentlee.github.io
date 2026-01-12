---
title: 'Killers of immutable performance — <strong>Zustand</strong>/<strong>Redux</strong> combined with <strong>React</strong>'
date: '2026-01-12'
cover: 'cover.webp'
cover-alt: 'The symbols "...", "||", "??", "[]" and "{}" grin with anticipation while looking at a sitting on a white couch character that symbolizes the combination of React, Redux, and Zustand'
spoiler: 'In this article, we will break down the <strong>main causes of performance degradation</strong> in immutable stores combined with React and discuss approaches to writing high-load code, including <strong>non-obvious and unfamiliar to many</strong>.'
links:
- discuss-github: https://github.com/gentlee/gentlee.github.io/discussions/4
---

![The symbols "...", "||", "??", "[]" and "{}" grin with anticipation while looking at a sitting on a white couch character that symbolizes the combination of React, Redux, and Zustand](/articles/2026-01-12-immutable-performance-zustand-redux-react/cover.webp)

### Introduction

Immutable UI development patterns have become some of the most popular in recent years due to a combination of simple architecture and good performance. They are built on functional programming without classes, using standard data structures (without extra magic or Proxy), fast (reference / shallow) comparison, and memoization at all levels. In general, these principles are almost the same ones React itself is built on. The downside of these patterns is performance degradation as the project grows, and how easy it is to break that performance with just a few familiar and seemingly harmless things. Once again — just like in React.

And perhaps the saddest part is that I have encountered these problems in absolutely every project where these patterns were used, and almost **regardless of the developers’ seniority**. There is clearly a need to improve code analyzers, like what ESLint does for React hooks, and to improve libraries by catching the most obvious mistakes already in debug builds. But until this is properly developed, I suggest going through the main problems and manually checking your projects for their presence.

### 1. Main problems

They are generally related to the previously mentioned characteristics — reference / shallow comparison at all levels.

It is enough to start returning a new object at any level on every call — and all subsequent levels will start working **as badly as possible**:
- a memoized selector (Reselect) will be recalculated.
- component store subscriptions will cause re-renders (`useSelector`, `mapStateToProps`).
- will trigger memoization hooks and effects (`useMemo`, `useCallback`, `useEffect`) where it appears in dependencies.
- when passing to child components, they will re-render regardless of their memoization (`memo`).

As a result, creating a new object at the data source can lead to unnecessary computations and VDOM re-renders up to the entire screen on every store update, even if the data has not actually changed. Immutable stores under peak load can change dozens of times per second, and what kind of slowdowns this can lead to needs no explanation. At the same time, tracking down the cause of the slowdown can be difficult, especially if object creation happens under certain rare conditions — cache misses, empty arrays, feature flags — while developers and QAs are working on top-tier hardware.

So, examples:

```js
// 1. Yes, it's that simple. Unfortunately, almost every reader of this article has
// done / is doing this. I'm sure many won't even realize it — [] creates a new array
// on every selector call when there is no data.
const selectItems = (state) => state.items ?? []

// 2. Well here, it would seem obvious that this should be memoized.
const selectFilteredItems = (state) => state.items?.filter(x => x)

const mapStateToProps = (state, ownProps) => {
  return {
    // 3. One of many variations of p.1 using ??.
    // And memoization does not help if the reselector returns `Falsy`.
    options: reselectOptions(state, ownProps.id) || {},
    // 4. Even dates betray us. Date is an object.
    date: parseDate(state.map[ownProps.id].dateString) 
    // 5. Selecting user and avatar is fine, but wrapping everything
    // into a new object will cause constant re-renders.
    userInfo: {
      user: selectUser(ownProps.id),
      avatar: selectAvatar(ownProps.id)
    },
  }
}

// 6. Can you spot the problem?
type Props = {
  items?: Item[]
  loading?: boolean | null
}

const ListScreen = memo(({items}: Props) => {
  // ...

  useEffect(() => {
    if (!items?.length) {
      fetchData()
    }
  }, [items?.length])
})
```

Fixing it:

```ts
// 1.1 If there is a need not to work with undefined, use constants.
const EMPTY_ARRAY = Object.freeze([])
const EMPTY_OBJECT = Object.freeze({})

const selectItems = (state) => state.items ?? EMPTY_ARRAY

// 1.2 Slightly worse — you can return an optional value,
// but then there will be a re-render when switching
// from [] to undefined and back, although behavior is often identical.
const selectItems = (state) => state.items

// 2. Memoization
const reselectFilteredItems = createSelector(
  selectItems,
  (items) => items.filter(x => x)
) 

const mapStateToProps = (state, ownProps) => {
  return {
    // 3. Either live with undefined, or move ?? {} into a memoized selector,
    // or use ?? EMPTY_OBJECT.
    options: reselectOptions(state, ownProps.id),
    // 4. Here we transformed all string dates into objects at the data access layer
    // (e.g., API client). This can also be done during render or in a memoized selector,
    // depending on the task.
    date: state.map[ownProps.id].date,
    // 5. Just don't wrap into a new object — keep props as "flat" as possible.
    user: selectUser(ownProps.id),
    avatar: selectAvatar(ownProps.id),
  }
}

// 6. Switching between false, null, undefined, numbers, and back will cause unnecessary
// useEffect recalculations. Make dependencies more stable.
// And yes, the problem was not only with useEffect, but also with memo.
type Props = {
  // Remove ? and | null — fewer possible re-renders,
  // but less convenient to use — up to you.
  items: Item[]
  loading: boolean
}

const ListScreen = memo(({items}: Props) => {
  // Now useEffect will not run on every array length change.
  const hasData = Boolean(items.length)

  useEffect(() => {
    // ...
  }, [hasData])
})
```

---

So, we have fixed the main problems that lead to re-rendering the entire screen 100 times per second. Let’s move on to slightly more complex topics.

### 2. Lists

Many believe it is impossible in immutable stores to re-render only a single list item when that item changes. In reality, it is quite simple — you need **normalization**. More precisely, store the data order (ids) and the data itself (entities) separately.

```ts
type State = {
  order: string[] // List of item ids.
  items: Record<string, Item> // The items themselves with O(1) lookup by id.
}

// The list subscribes only to order, and each individual cell - to its own entity:

const ListScreen = () => {
  const order = useSelector(selectOrder)
  // ...
}

const ListScreenItem = memo(({id}: {id: string}) => {
  const item = useSelector((state) => selectItem(state, id))
  // ...
})
```

---

### 3. Memoized selectors with parameters

With memoized selectors, it is important to understand where the memoization is stored. Reselect, by default, stores the cache inside the selector itself, and only for the last value of the last input parameters. If multiple mounted components use it with different parameters or different stores, it will be constantly recalculated:

```tsx
const reselectOptions = createSelector(
  (state: State) => state.items,
  (_, id: string) => id,
  (items, id) => items.find(x => x.id === id)?.options,
)

const Item = ({id}: {id: string}) => {
  const options = useSelector((x) => reselectOptions(x, id))
  
  // ...
}

const Screen = () => {
  // Two simultaneously mounted components completely negate memoization,
  // causing constant selector recalculation.
  return (
    <>
      <Item id={id1}/>
      <Item id={id2}/>
    </>
  )
}
```

The most trivial solution is to cache the selector inside the component.

```ts
const Button = ({id}: {id: string}) => {
  const reselectOptions = useMemo(() => createReselectOptions(id), [id])
  const options = useSelector(reselectOptions)
}
```

Or read the [documentation](https://reselect.js.org/api/weakMapMemoize) about other ways to configure LRU or WeakMap caching.

---

### 4. Immer

One of the best ways to degrade immutable store performance [by 100x](https://github.com/reduxjs/redux-toolkit/issues/4793) is to use Immer. And yes, it is used by default and cannot be disabled in RTK slices and RTK Query. Which means they **do not suit us** — for RTK, use vanilla reducers.

---

### 5. Don’t write boilerplate

Many mistakes can simply be avoided by not re-implementing data loading and caching over and over again. Many libraries already exist, from Tanstack Query to Apollo Client. The only issue is that all of them use their own closed stores without direct access. The exception is RTK Query, but we have already decided not to use it (and not only because of performance issues).

An excellent solution for Zustand / Redux is the [RRC](https://github.com/gentlee/react-redux-cache) library, which has a very simple yet flexible interface, full typing, more than 100 unit tests, an immutable store of your choice (Redux/Zustand), supports normalization, deduplication, infinite pagination, mutable collections (see below), and much more. And of course, it does not use Immer — performance is a priority.

---

### 6. Splitting stores

In most projects, there are no issues with storing data in a single store. But if you expect many simultaneously mounted screens under heavy load, it makes sense to split immutable stores in order to **reduce the number of subscribers** (store write time includes both state mutation and subscriber notification with selector computation), as well as to slightly reduce string comparisons (`action.type` in Redux) and shallow copying of root objects. One option is to split the model into independent domains and create a store for each.

And it is not necessary to use only one type of store — instead, choose the one that fits a specific type of data.

Store splitting options:

- Application theme (light, dark) — can be stored in `React.Context`. Changes rarely, may be subscribed to by almost every component, so keeping it in a single global store is not the best idea.
- Metadata not required for rendering can be stored mutably — no subscribers, frequent changes.
- Separate immutable stores for:
  - User settings and feature flags — many subscribers, rarely changes, restored/cleared on login/logout.
  - Local global settings for all users (Debug menu) — few subscribers, restored at app start, not cleared on logout.
  - Domain models and loading states for specific screen groups (Calendar, Calls, etc.) — subscribed only by those screens, can be restored/cleared on mount/unmount and/or logout.
  - Domain models and loading states for all screens (User, Channel entities, etc.) — many subscribers, frequent updates, restored/cleared on login/logout. Highly performance-sensitive, see the “Data copying” section.

And yes, Redux also [supports](https://github.com/gentlee/redux-light/blob/master/src/create-context-and-hooks.ts) multiple stores, albeit not very conveniently and not very well documented.

#### Objections

1. Redux documentation does not recommend doing this, so we shouldn’t.

    The developer is responsible for their code, not the Redux team. Mattermost Mobile V1 team paid for this - rewrote everything and it still turned out poorly.
2. Then it’s better to choose another type of store.

    If you chronically don’t understand how technologies work and how to use them effectively, rewriting everything to something else does not guarantee solving all problems. And for Zustand, splitting stores is actually the correct approach.
3. Most projects don’t need this.
    
    Yes.

---

### 7. Unnecessary subscriptions

Code becomes slightly more efficient if you don’t subscribe to data that is not needed for rendering. For example, data used only inside event handlers.

```ts
const Button = () => {
  const store = useStore()

  // Do not do this:
  // const worldName = useSelector(selectWorldName)
  // const currentId = useSelector(selectCurrentId)

  const onPress = () => {
    // Subscription will not update the alert anyway.
    Alert.alert(`Hello, ${selectWorldName(store.getState())}!`)

    // And not needed here either.
    const currentId = selectCurrentId(store.getState())
    fetchData(currentId)
  }
}
```
#### Objections
1. This doesn’t help much, but now I also have to think about this.

    When writing code, it’s better to think all the time — it’s a habit worth developing. Also, small optimizations may be invisible on their own but work very well when applied everywhere.

---

### 8. Data copying

The asymptotic complexity of adding an element to a standard collection (array, object) in an immutable store is O(N), since it requires shallow copying (usually via the `...` operator). Additionally, garbage collection is required for the previous collection. For most projects this is not an issue, since collection sizes rarely exceed 1000 and battery consumption is not critical. But for huge projects this can become a problem, and there are ways to turn O(N) into O(log N), or even O(1).

### 8.1. O(log N) — Immutable.js

Everything is simple here — replace arrays with List and objects with Map from the `immutable` library. Briefly about the implementation: we now work with a tree structure where the size of array “leaves” does not exceed a certain value (usually 32). In the case of List, each tree leaf is an array of up to 32 elements, and when the threshold is exceeded, the nesting level increases — a new branch is created, where one of the leaves is the old array. For example, storing a billion values requires only 6 levels of nesting.
There are downsides as well — slower for small collections, serialization, debugging, new API. Better to read [here](https://redux.gitbook.io/docs/recipes/usingimmutablejs#what-are-the-issues-with-using-immutable.js).

### Objections
1. Learn another library again, rewrite half the project, and in the end everyone will write `.toJS()` everywhere and it will only get worse.

    If you are not confident about performance issues, development processes, or the team’s ability to learn a small library, you shouldn’t go there. Start with profiling and basic optimizations from other sections.

### 8.2. O(1) — Mutable collections

No copying — no problems (almost). When you understand how the technology works, making localized optimizations is not a problem, but many people don’t fully understand it and, naturally, are afraid. Using an immutable store usually <strong>does not forbid mutable data</strong>, it just prevents direct subscriptions to it and the use of tools like time-travel debugging (does anyone actually use that?). But you can always subscribe indirectly via a special change key:

```ts
type State = {
  // Mutable list of item ids, prefixed with _ — cannot be subscribed to directly.
  _order: string[]
  // Update orderChangeKey together with the array.
  orderChangeKey: number
}

const mergeLastPageOrder = (itemIds: string[]) => {
  const {_order, orderChangeKey} = getState()
  _order.push(...itemIds)
  setState({orderChangeKey: orderChangeKey + 1})
} 

const useOrder = () => {
  const changeKey = useSelector(selectOrderChangeKey) // Subscribe only to changeKey.
  return [useStore().getState()._order, changeKey]
}
```

There are a couple more nuances:
- Treat such a collection like an analogue of `useRef()`, and pass `changeKey` instead of it where a dependency on changes is needed.
- Keep in mind that the value updates immediately, while component props update only after rendering. It’s better to search by id rather than by an index passed through props, and to assume the element might not exist (which is a good practice even without mutability).

Besides performance, one more advantage is the absence of [specific downsides]((https://redux.gitbook.io/docs/recipes/usingimmutablejs#what-are-the-issues-with-using-immutable.js)) of Immutable.js collections.

Recently, version 0.22.2 of the [RRC](https://github.com/gentlee/react-redux-cache) library was released, which allows making all its internal collections mutable with a single option. In most cases, the rest of the code does not need to be changed, since there should not be direct subscriptions to its internal collections anyway. There is also a benchmark demonstrating when this makes sense (briefly and roughly — for collections larger than 1000 elements).

Results of the [benchmark](https://github.com/gentlee/react-redux-cache/blob/main/scripts/benchmark.mjs) of element insertion time depending on collection size, **in microseconds** (lower is better):

| Collection size | 0 | 1,000 | 10,000 | 100,000 | 1,000,000 |
|-|-|-|-|-|-|
| Immutable reducer | 1.57 | 1.81 | 7.62 | 103.82 | 1457.89 |
| Mutable reducer | 1.4 | 1.15 | 0.65 | 1.03 | 0.76 |

#### Objections
1. This is not according to the documentation, you can’t do this!

    Yes, I don’t recommend doing this all the time — it’s unlikely that performance issues stem from this. But it’s worth knowing about this possibility, as well as about storing mutable data in such stores in general — for example, metadata that should be cleared together with the store. Or as an optimization technique for large collections if you don’t want to pull in Immutable.js.

---

### 9. Persistence

Oh, that `redux-persist`, which in many projects is configured so poorly that it saves not only individual reducers but additionally the entire state...

Briefly:
- Persistence is far from always needed.
- If the state is compact, easily fits entirely in memory, and loads quickly from disk, then it should be loaded entirely at startup.
  - The code is simple and synchronous — do not work with persistent storage directly, only through store updates.
  - Use any reliable key/value storage that does not cache state in memory — we already do that. Serialize to JSON.
  - Split state storage into separate keys to optimize large stores — don’t store everything under one key. Take size and update frequency into account.
  - Use debounce.
- If the state is too large to load entirely at startup, you can use, for example, an SQL database.

And most importantly — log and measure disk operations so you don’t end up in the situation described in the first paragraph.

---

### 10. Interface responsiveness-critical operations
It’s important to understand that immutable stores are not designed for bidirectional binding of user input in text fields or for animating the coordinates of an object being dragged across the screen. For highly frequent and critical interface updates with minimal delay, a more imperative approach should be used, ideally one that doesn't require even a VDOM re-render. For example, in React Native, `react-native-reanimated` is often used for this purpose.

---

## Summary

In this article, we covered non-obvious and fairly common — critical and not so critical — performance issues of immutable code found in most projects. Each item could deserve a separate article, but I tried to compress it as much as possible. If I missed something — let’s discuss it in the comments.

Keep in mind that if your project is small, you shouldn’t blindly follow all these recommendations — some of them are required only in high-load applications or in React Native, where performance headroom on older Android devices is limited and battery consumption matters.

And of course, it’s important to understand what premature optimization is:
- More complex, non-standard code requiring unusual approaches and libraries in a small project? Yes, that looks like it.
- Code written optimally for the main libraries? No — that is the developer’s responsibility.


