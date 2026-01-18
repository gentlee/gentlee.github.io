---
title: 'Библиотека <strong>RRC</strong> для управления запросами и кэшем для <strong>Zustand/Redux</strong>: [лучшая] <strong>альтернатива RTK-Query</strong> и другим решениям'
shortTitle: '<strong>RRC</strong>: управление кэшем в Zustand/Redux'
date: '2024-09-14'
cover: 'cover.webp'
cover-alt: 'Изображение примера нормализованного состояния'
spoiler: 'Вашему вниманию представляется <code>react-redux-cache</code> (RRC) - легковесная библиотека для загрузки и кэширования данных в React приложениях, которая поддерживает нормализацию, в отличие от React Query и RTK Query, при этом имеет похожий, но очень простой интерфейс. Построена для Zustand/Redux, покрыта тестами, полностью типизирована и написана на Typescript.'
links:
- npm: https://www.npmjs.com/package/react-redux-cache
- github: https://github.com/gentlee/react-redux-cache
- discuss-github: https://github.com/gentlee/gentlee.github.io/discussions/2
- discuss-habr: https://habr.com/ru/articles/842940/comments/
---

Вашему вниманию представляется  [react-redux-cache](https://github.com/gentlee/react-redux-cache)  (RRC) - легковесная библиотека для загрузки и кэширования данных в React приложениях, которая поддерживает нормализацию, в отличие от  **React Query**  и  **RTK Query**, при этом имеет похожий, но очень простой интерфейс. Построена для Zustand/Redux, покрыта тестами, полностью типизирована и написана на Typescript.

Так же, в отличие от  **RTK Query**, без проблем поддерживается такая базовая вещь, как бесконечная прокрутка с пагинацией (см. пример далее).

RRC можно рассматривать как ApolloClient для протоколов, отличных от GraphQL (хотя теоретически и для него тоже), но на базе собственного хранилища (Zustand/Redux) - с возможностью писать собственные селекторы (selector), экшены (action) и редьюсеры (reducer), имея полный контроль над кэшированным состоянием.

Принципы, с которыми создавалась библиотека:

- Максимальная простота, минимум ограничений. Все самые необходимые функции доступны из коробки, остальное - не проблема реализовать.
- Высокая производительность.
- Высокое покрытие тестами, 100%-ая типизация, нетерпимость к багам.
- Функциональный стиль.
    
## Зачем?

Далее пойдет сравнение с имеющимися библиотеками для управления запросами и состоянием. Почему вообще стоит пользоваться библиотеками для этого, а не писать все вручную с помощью useEffect / redux-saga и тп - оставим эту тему для других статей.

- Полный контроль над хранилищем не только дает больше возможностей, упрощает отладку и написание кода, но и позволяет городить  **меньше костылей**  если задача выходит за рамки типичного hello world из документации, не тратя огромное время на страдания с очень сомнительными интерфейсами библиотек и чтением огромных исходников.
    
- Zustand/Redux это отличные - простые и проверенные инструменты для хранения “медленных” данных, то есть тех, что не требуют обновления на каждый кадр экрана / каждое нажатие клавиши пользователем.  **Порог входа**для тех, кто знаком с библиотекой - минимальный. Экосистема предлагает  **удобную отладку и множетсво готовых решений**, таких как хранение состояния на диске (redux-persist). Написан в  **функциональном** стиле.
    
- Нормализация - это лучший способ поддерживать согласованное состояние приложения между различными экранами,  **сокращает количество запросов**  и без проблем позволяет сразу отображать кэшированные данные при навигации, что значительно  **улучшает пользовательский опыт**. А аналогов, поддерживающих нормализацию, практически нет - ApolloClient поддерживает только протокол GraphQL, и сделан в весьма сомнительном, переусложненном ООП стиле.
    
- **Легковесность**, как размера библиотеки, так и ее интерфейса - еще одно преимущество. Чем проще, тем лучше - главное правило инженера, и данной конкретной библиотеки.
    

Краткое сравнение библиотек в таблице:

|  |React Query|Apollo Client|RTK-Query|RRC|
|--|--|--|--|--|
|Полный доступ хранилищу|-|-|+-*|+|
|Поддержка REST|+|-|+|+|
|Нормализация|-|+|-|+|
|Бесконечная пагинация|+|+|-**|+|
|Не переусложнена***|+|-|-|+|
|Популярность|+|+|-****|-|

\* - Отсутствуют экшены для изменения состояния вручную.

\** - [Да](https://github.com/reduxjs/redux-toolkit/discussions/1163#discussioncomment-849158), вот такой "мусор" этот RTK-Query.

\*** - Моя субъективная оценка, где учитывается кривая обучения, удобство использования, сложность выполнения простых задач, таких как реализация бесконечной пагинации, сохранение данных на диске и другие аспекты.

\**** - RTK в целом имеет наименьшее количество звёзд по сравнению с другими популярными библиотеками, а RTK-Query, являясь его необязательной частью, пользуется ещё меньшей популярностью.

#### Почему только React?

Поддержка всевозможных UI библиотек кроме самой популярной (используемой в том числе в React Native) - усложнение, на которое я пока не готов.

## Примеры

Для запуска примеров из папки  `/example`  используйте  `npm run example`. Доступны три примера:

- С нормализацией (рекомендуется).
- Без нормализации.
- Без нормализации, оптимизированный.
    

Данные примеры - лучшее доказательство того, как сильно зависит пользовательский опыт и нагрузка на серверы от реализации клиентского кэширования. В плохих реализациях на любую навигацию в приложении:

- пользователь вынужден наблюдать спинеры и прочие состояния загрузки, будучи заблокированным в своих действиях, пока она не закончится.
- запросы постоянно отправляются, даже если имеющиеся данные все еще достаточно свежие.
    

#### Пример состояния с нормализацией

```javascript
{
  entities: {
    // Каждый тип имеет свой словарь сущностей, хранящихся по id
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
    // Каждый запрос имеет свой словарь состояний, хранящихся по ключу кэша, генерируемого из параметров запроса
    getUser: {
      "2": {result: 2, params: 2, expiresAt: 1727217298025},
      "3": {loading: true, params: 3}
    },
    getUsers: {
      // Пример состояния с пагинацией под переопределенным ключом кэша (см. далее в пункте про пагинацию)
      "all-pages": {
        result: {items: [0,1,2], page: 1},
        params: {page: 1}
      }
    }
  },
  mutations: {
    // Каждая мутация также имеет свое состояния
    updateUser: {
      result: 1,
      params: {id: 1, name: "User 1 *"}
    } 
  }
}

```

#### Пример состояния без нормализации

```javascript
{
  // Словарь сущностей используется только для нормализации, и здесь пуст
  entities: {},
  queries: {
    // Каждый запрос имеет свой словарь состояний, хранящихся по ключу кэша, генерируемого из параметров запроса
    getUser: {
      "2": {
        result: {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"},
        params: 2,
        expiresAt: 1727217298025
      },
      "3": {loading: true, params: 3}
    },
    getUsers: {
      // Пример состояния с пагинацией под переопределенным ключом кэша (см. далее в пункте про пагинацию)
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
    // Каждая мутация также имеет свое состояния
    updateUser: {
      result: {id: 1, bank: {id: "1", name: "Bank 1"}, name: "User 1 *"},
      params: {id: 1, name: "User 1 *"}
    } 
  }
}
```

### Установка

`react`,  `redux`  и  `react-redux`  являются peer-зависимостями.

`fast-deep-equal` - опциональная peer-зависимость, если нужно глубокое сравнение для оптимизации ре-рендеринга (`deepComparisonEnabled`, по умолчанию  `true`).

```bash
npm add react-redux-cache react redux react-redux fast-deep-equal
```

### Инициализация

Единственная функция, которую нужно импортировать — это  `createCache`, которая создаёт полностью типизированные редьюсер, хуки, экшены, селекторы и утилиты для использования в приложении. Можно создать столько кэшей, сколько нужно, но учтите, что нормализация не переиспользуется между ними. Все типы, запросы и мутации должны быть переданы при инициализации кэша для корректной типизации.

#### cache.ts

```typescript
// Cоответствие нормализованных сущностей их типам
// Не используется если нормализация не нужна, достаточно импортировать `createCache` вместо `withTypenames`
export type CacheTypenames = {
  users: User // сущности `users` будут иметь тип `User`
  banks: Bank
}

export const {
  cache,
  reducer,
  hooks: {useClient, useMutation, useQuery},
} = withTypenames<CacheTypenames>().createCache({
  // Используется как префикс для экшенов и в селекторе выбора состояния кэша из состояния сторов
  name: 'cache',
  queries: {
    getUsers: { query: getUsers },
    getUser: {
      query: getUser,
      secondsToLive: 5 * 60 // Здесь кэш валиден в течение 5 минут.
    },
  },
  mutations: {
    updateUser: { mutation: updateUser },
    removeUser: { mutation: removeUser },
  },
})
```

Для нормализации требуется две вещи:

- Задать typenames при создании кэша - список всех сущностей и соответствующие им типы TS.
- Возвращать из функций query или mutation объект, содержащий помимо поля result данные следующего типа:
    

```typescript
type EntityChanges<T extends Typenames> = {  
  // Сущности, что будут объединены с имеющимися в кэше
  merge?: PartialEntitiesMap<T>
  // Сущности что заменят имеющиеся в кэше
  replace?: Partial<EntitiesMap<T>>
  // Идентификаторы сущностей, что будут удалены из кэша
  remove?: EntityIds<T>
  // Алиас для `merge` для поддержки библиотеки normalizr
  entities?: EntityChanges<T>['merge']
}
```

#### store.ts (Redux)

Создайте store как обычно, передав новый редьюсер кэша под именем кэша. Если нужна другая структура redux, нужно дополнительно передать селектор состояния кэша при создании кэша.

```typescript
const store = configureStore({
  reducer: {
    [cache.name]: reducer,
    ...
  }
})
```

#### api.ts

Тип результата запроса должен быть  `NormalizedMutationResponse`  или  `QueryResponse`, результата мутации —  `NormalizedMutationResponse`  или  `MutationResponse`. Для нормализации в этом примере используется пакет  **normalizr**, но можно использовать другие инструменты, если результат запроса соответствует нужному типу. В идеале - бэкэнд возвращает уже нормализованные данные.

По части race condition:

- Для query используется throttling - пока идет запрос с определенными параметрами, другие с теми же параметрами отменяются.
- Для мутаций используется debounce - каждая следующая мутация отменяет предыдущую, если та еще не завершилась. Для этого вторым параметром в мутации передается abortController.signal.
    

```typescript
// Пример запроса с нормализацией (рекомендуется)

export const getUser = async (id: number) => {
  const result = await ...
  
  const normalizedResult: {
    // result - id пользователя
    result: number
    // entities содержат все нормализованные сущности
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUserSchema)

  return normalizedResult
}

// Пример запроса без нормализации

export const getBank = (id: string) => {
  const result: Bank = ...
  return {result}
}

// Пример мутации с нормализацией

export const removeUser = async (id: number, abortSignal: AbortSignal) => {
  await ...
  return {
    remove: { users: [id] }, // result не задан, но указан id пользователя, что должен быть удален из кэша
  }
}
```

#### UserScreen.tsx

```typescript
export const UserScreen = () => {
  const {id} = useParams()

  // useQuery подключается к состоянию стора, и если пользователь с таким id уже закэширован,
  // запрос не будет выполнен (по умолчанию политика кэширования 'cache-first')
  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    params: Number(id),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  // Этот hook возвращает сущности с правильными типами — User и Bank
  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  if (loading) {
    return ...
  }

  return ...
}
```

## Продвинутые возможности

#### Бесконечная прокрутка с пагинацией

Вот пример конфигурации запроса  `getUsers`  с поддержкой бесконечной пагинации - фичи, недоступной в RTK-Query (facepalm). Полную реализацию можно найти в папке  `/example`.

```typescript
// createCache

...
} = createCache({
  ...
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages', // Для всех страниц используется единый ключ кэша
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

// Компонент

export const GetUsersScreen = () => {
  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: 1 // страница
  })

  const refreshing = loading && params === 1
  const loadingNextPage = loading && !refreshing

  const onRefresh = () => fetchUsers()

  const onLoadNextPage = () => {
    const lastLoadedPage = usersResult?.page ?? 0
    fetchUsers({
      query: 'getUsers',
      params: lastLoadedPage + 1,
    })
  }

  const renderUser = (userId: number) => (
    <UserRow key={userId} userId={userId}>
  )

  ...

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

Вот простейшая конфигурация redux-persist:

```typescript
// Удаляет `loading` и `error` из сохраняемого состояния
function stringifyReplacer(key: string, value: unknown) {
  return key === 'loading' || key === 'error' ? undefined : value
}

const persistedReducer = persistReducer(
  {
    key: 'cache',
    storage,
    whitelist: ['entities', 'queries'], // Cостояние мутаций не сохраняем
    throttle: 1000, // ms
    serialize: (value: unknown) => JSON.stringify(value, stringifyReplacer),
  },
  cacheReducer
)
```

Другие примеры использования можно найти в  [документации](https://github.com/gentlee/react-redux-cache).

## Заключение

Хоть проект и находится на стадии развития, но уже готов к использованию. Конструктивная критика и квалифицированная помощь приветствуется.
