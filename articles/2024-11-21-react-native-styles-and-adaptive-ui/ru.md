---
title: 'Стили, темы и <strong>адаптивная верстка</strong> в React Native'
shortTitle: '<strong>Адаптивная верстка</strong> в React Native'
date: '2024-11-21'
cover: 'cover.webp'
cover-alt: 'Изображение адаптивной верстки на разных устройствах - от смартфонов до экрана компьютера, с довольным котом'
spoiler: 'Из этой статьи вы узнаете, как эффективно организовать очень важную часть разработки на React Native - работу со стилями и ресурсами для создания адаптивных и доступных интерфейсов под три платформы: <b>iOS</b>, <b>Android</b> и <b>Web</b>, и нужны ли для этого библиотеки. Также в целом обсудим особенности верстки и проблемы производительности в рамках данного фреймворка.'
links:
- discuss-github: https://github.com/gentlee/gentlee.github.io/discussions/3
- discuss-habr: https://habr.com/ru/articles/860156/comments/
---
![Изображение адаптивной верстки на разных устройствах - от смартфонов до экрана компьютера, с довольным котом](/articles/2024-11-21-react-native-styles-and-adaptive-ui/cover.webp)

Из этой статьи вы узнаете, как эффективно организовать очень важную часть разработки на React Native - работу со стилями и ресурсами для создания адаптивных и доступных интерфейсов под три платформы: <b>iOS</b>, <b>Android</b> и <b>Web</b>, и нужны ли для этого библиотеки. Также в целом обсудим особенности верстки и проблемы производительности в рамках данного фреймворка.

Для React Native, помимо стандартных  `StyleSheets`, существует множество библиотек для стилизации интерфейсов, таких как  **NativeWind**,  **Tamagui**,  **Dripsy**,  **Styled Components**. В сети можно найти сравнительные  [бенчмарки](https://github.com/efstathiosntonas/react-native-style-libraries-benchmark)  для этих библиотек, после изучения которых можно сделать однозначный вывод: все они так или иначе ухудшают производительность, причем иногда - на порядок. Впрочем, данный вывод можно было сделать и логически - большинство библиотек вычисляет стили во время выполнения, создают обертки над компонентами, увеличивая VDOM, и в целом выполняют куда больше кода, нагружая и без того перегруженный всем чем только можно поток JS, ответственный как за рендеринг, парсинг данных и бизнес логику, так и за обработку нажатий.

Имея 8 лет опыта и 13 проектов только на React Native, могу смело утверждать, что нагружать поток JS неоптимальным кодом и лишней работой  **часто**  плохо сказывается на отзывчивости приложений, особенно на слабых Android устройствах. И неоптимальный рендеринг VDOM с последующей сборкой мусора часто стоит на первом месте по времени выполнения. Но стоит отметить, что если писать код осмысленно, то с производительностью проблем не будет.

Также, бездумное добавление сторонних библиотек, тем более нативных, часто приводит к всевозможным ошибкам на всем многообразии устройств и операционных систем, особенно после очередного обновления этих самых библиотек или фреймворка. Главный принцип разработки на React Native (и не только) - добавляя стороннюю зависимость, ты добавляешь все баги (GitHub Issues) этой зависимости в свой проект, а в случае с нативными библиотеками - умножай их количество на количество платформ.

А зачем вообще использовать библиотеки для стилей? Неужели встроенного в RN функционала не хватает? Или это банальная привычка  ~~рукожопов~~  новичков тянуть в проект зависимости чтобы сложить 2 + 2? В документации React Native действительно не хватает лучших практик для верстки под разные темы и размеры  экранов  окон, но все таки делать это довольно просто, и скоро я покажу как. Так что скорее второе.

## Задача

Сделать адаптивный и доступный интерфейс для платформ iOS, Android и Web, включая десктоп, планшеты и разные ориентации экрана. Минимальная поддерживаемая ширина окна - 320px.

## Как НЕ надо

> Почему у НЕнативных технологий хуже репутация, даже если они лучше? На них всегда можно переложить ответственность за все проблемы. Что регулярно и происходит.

1.  Многие начинающие разработчики возьмутся  **хардкодить**  всевозможные  **глобальные константы**  типа  `isLargeScreen`,  `isPhone`,  `isTablet`  и т.д. и т.п., и повсеместно использовать их для вычисления стилей, превращая код в такую кашу, в которой можно годами править баги верстки разных экранов и платформ, и так и не поправить. В случае со статическими стилями конечно же ни о какой адаптивной верстке не может быть и речи - изменение ориентаций, размеров окон и масштабирование в браузере поддерживаться не будут. В дальнейшем виноват будет фреймворк React Native, потому что разработчик, и тем более его руководитель - не виноваты (если их спросить).
    
2.  Самые одаренные и неопытные бросятся  **умножать размеры**  шрифтов, отступов и элементов на какой нибудь scale, полученный исходя из деления размера экрана на магическое число. Такую верстку, да вкупе с предыдущим пунктом, можно смело выкидывать на помойку целиком. Запомните -  **размер пальцев и глаз людей не зависит от размера и разрешения экрана**, а значит и размеры кнопок и шрифтов не должны от него зависеть. Также, по требованиям доступности нажимаемые элементы не должны быть меньше 44 пикселей, и у шрифтов тоже есть свои ограничения. Отступы уменьшать допустимо, но об этом позже. Также важно понимать, что в React Native все размеры указываются  **не в пикселях, а в логических пикселях**  (или по другому - масштабируемых пикселях), не зависящих от плотности пикселей экрана, и также не нуждаются в дополнительном масштабировании.
    
3.  Другая часть выберет путь использования  **сторонних библиотек**  для стилизации, чем поставят крест на высокой производительности приложения, помножат количество багов и увеличат кривую онбординга на проект очередной криво написанной документацией. В дальнейшем для оптимизации и исправления багов придется переписывать все компоненты.
    
4.  По поводу вынесения размеров шрифтов и всевозможных отступов в глобальные константы / тему - в абсолютном большинстве случаев это не только не имеет смысла, но и вредно - за мои 30 проектов мобильных приложений на разных технологиях не было ни одного случая, когда дизайнер захотел бы, например, изменить все размеры шрифтов с 14 до 15, или все отступы 16 заменить на 18, и весь этот оверинжиниринг хоть бы раз пригодился. Пара возможных исключений: 1) наличие стандартизированной дизайн системы, где размеры еще и зависят от размера окна 2) значения, либо стили схожих компонентов, которые точно должны быть одинаковыми - в этом случае можно экспортировать общие стили либо вынести значения в константы. В остальных случаях - хардкодим и не дурим друг другу головы.
    
5.  Внешние отступы у компонентов. Их по умолчанию быть не должно. Если они нужны, пусть передаются через свойства -  `style`, либо отдельные. Следует максимально где возможно использовать  `gap`,  `rowGap`,  `columnGap`  у контейнеров, чтобы в принципе минимизировать использование  `margin`. Поддерживать код, в котором у компонентов по умолчанию заданы отступы, и переопределены во многих местах - это очень больно и багоемко.
    

Стоит отметить, что почти все перечисленные проблемы характерны и для нативной мобильной разработки.

## Как можно и нужно

### 1. База

1.  Помним, что любое приложение находится в окне. Размер экрана нам не важен. Важен размер окна.
    
2.  По требованиям доступности, десктоп сайт должен без проблем  **масштабироваться до**  **400%**. Поддерживая это требование, мы автоматически поддерживаем и мобильные устройства - ведь во всех браузерах масштабирование делается путем симуляции уменьшения ширины экрана и приближения, и верстка на большом масштабе аналогична экранам телефонов, без дополнительных усилий. Поэтому здесь мы убиваем двух зайцев.
    
3.  Для нас телефон, планшет и десктоп, да в разных ориентациях - ничем не отличаются, кроме ширины окна, поэтому поддерживая всего лишь разную ширину окон, мы автоматически поддерживаем все типы устройств и все ориентации. Чаще всего планшеты и телефоны в горизонтальной ориентации идентичны десктопу. Еще минус несколько проблем. Делать различия для сенсорных и не сенсорных экранов на практике не было необходимости, и в данной статье этот момент не рассматривается.
    
4.  Flexbox - единственный доступный из коробки, но очень мощный инструмент для верстки, редко требующий хардкода платформ, размеров окна и родительских компонентов. Если есть недостаток понимания его работы, то обязательно стоит пройти какие нибудь курсы:  `flexDirection`,  `flex`,  `flexGrow`,  `flexShrink`,  `flexWrap`,  `gap`,  `alignItems`,  `justifyContent`,  `minWidth`,  `maxWidth`  и многое другое - нужно знать.
    

### 2. Стили

Заранее стоит отметить, что все приведённые ниже фрагменты кода представляют собой лишь примеры реализации различных подходов, которые можно адаптировать под конкретный проект. При этом важно помнить главный принцип разработки — **KISS** (Keep It Simple, Stupid) — и избегать добавления кода в проект, пока в нём действительно не возникнет необходимости.

1.  Хранить стили лучше в файле с компонентом по трем причинам: а) не придется создавать папки для простых компонентов б) не нужно писать дополнительный import и перескакивать между файлами в) поддерживаются правила eslint  `react-native/no-unused-styles`  из  `eslint-plugin-react-native`, а по опыту неиспользуемые стили в RN встречаются довольно часто. Если компонент получается слишком большим, то считать, что вынесение стилей как то с этим поможет - заблуждение, ведь компонент от этого никак не уменьшиться и не станет читаемее. Стоит задуматься о разбиении этого компонента на разные, либо вынесении части логики в утилиты или hook.
    
2.  Первый вариант вычислять стили -  **динамически в рендере**, используя состояние, свойства,  `useWindowDimensions`, текущую тему и т.д., и опционально завернув в  `useMemo`  (часто не имеет смыла). Производительность немного просядет, ведь придется создавать стили как минимум при первой отрисовке  **каждого**  компонента, а чаще всего при каждой. Также, из за подписки на размер экрана компонент будет перерисовываться на каждое изменение размера окна, а не только при смене типа верстки с широкой на узкую - например растягивание окна браузера может подлагивать, но это не самая большая проблема. Подходит для ситуаций, когда стили вычисляются из состояния и свойств, уникальных для каждого компонента, либо если вычислений совсем немного.
    
3.  Другой вариант -  **создать стили статически**  **сразу для разных вариантов**, например для светлой и темной темы -  `lightStyles`  и  `darkStyles`, и применять в компоненте исходя из настроек системы:  `const styles = isDark ? darkStyles : lightStyles`. Хороший вариант, если у стилей всего одна булева зависимость, например темная / светлая тема. Минус - не подходит когда зависимостей больше. Также при старте приложения выполняется больше кода, что в теории может плохо влиять на время запуска (вроде бы Hermes такое оптимизирует, но это не точно).
    
4.  Оптимальный вариант -  **утилита кэширования для глобальных стилей.**  Может использоваться обычный  **memoizeOne**, но в нем есть проблема с типизацией возвращаемых стилей и чуть больше кода, чем в приведенной далее самописной утилите. Стили вычисляются лениво, только при изменении зависимостей, например когда верстка меняется с широкой на узкую, либо при изменении темы - со светлой на темную, а компоненты переиспользуют мемоизированные стили. Из минусов - правила eslint из первого пункта будут показывать ошибку (на момент написания статьи). Подходит для стилей с глобально уникальными (singleton) зависимостями. Например размер окна обычно глобально уникален, как и текущая тема, а вот состояние компонента - нет.
    

Как это выглядит в коде:

```typescript
// Сколько бы не было одновременно замонтировано компонентов, используюзих
// эти стили, они вычисляться только один раз, и пересчитываются только на
// изменение isSmallLayout или theme.
const getStyles = memoizeStyles((isSmallLayout: boolean, theme: Theme) => {
  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContentContainer: {
      padding: isSmallLayout ? 8 : 16,
    },
  })
})
```

<details>
  <summary>memoizeStyles</summary>
  
```typescript
/**
 * Возвращает функцию, которая возвращает мемоизированные стили для
 * последних поверхностно равных (shallowly equal) аргументов.
 * Eсли еще не мемоизированы - создает с помощью функции styleCreator.
 * Работает аналогично memoizeOne, но код проще, и лучше типизирована.
 */
export const memoizeStyles = <
  A extends unknown[],
  S extends StyleSheet.NamedStyles<S> | StyleSheet.NamedStyles<any>
>(
  styleCreator: (...args: A) => S
): ((...args: A) => S) => {
  let lastArgs: A
  let style: S
  return (...args: A) => {
    if (!style || !shallowEqualArrays(args, lastArgs)) {
      style = StyleSheet.create(styleCreator(...args))
      lastArgs = args
    }
    return style
  }
}

const shallowEqualArrays = (
  arrA: unknown[],
  arrB: unknown[]
): boolean => {
  if (arrA === arrB) {
    return true
  }

  if (!arrA || !arrB) {
    return false
  }

  const length = arrA.length

  if (arrB.length !== length) {
    return false
  }

  for (let i = 0; i < length; i += 1) {
    if (arrA[i] !== arrB[i]) {
      return false
    }
  }

  return true
}
```
</details>

Использование стилей:

```typescript
export const ListScreen = () => {
  // SmallLayoutProvider можно добавить в корневом компоненте App, и при
  // необходимости переопределять для некоторых экранов с другим значением
  // c помощью withSmallLayoutContext.
  const isSmallLayout = useSmallLayoutContext()
  const theme = useTheme()
  const styles = getStyles(isSmallLayout, theme)
  
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      ...
    />
  )
}
```

<details>
  <summary>useSmallLayoutContext</summary>

```typescript
/** Возвращает меньше ли текущая ширина окна заданного в Provider порога. */
export const useSmallLayoutContext = () => {
  return useContext(SmallLayoutContext)
}

export const SmallLayoutContextProvider: FC<PropsWithChildren<{ threshold?: number }>> = ({ children, threshold = 785 }) => {
  return (
    <SmallLayoutContext.Provider value={useIsSmallLayout(threshold)}>
      {children}
    </SmallLayoutContext.Provider>
  )
}

export const withSmallLayoutContext = <P extends PropsWithChildren>(
  Component: ComponentType<P>,
  threshold?: number
): ComponentType<P> => {
  const WithSmallLayoutContext: FC<P> = (props) => {
    return (
      <SmallLayoutContextProvider threshold={threshold}>
        <Component {...props} />
      </SmallLayoutContextProvider>
    )
  }
  return WithSmallLayoutContext
}

// Хук

// Версия с useWindowDimensions перерендерит при любом изменении размера
// окна, тогда как данная версия только при изменении значения isSmallLayout.

// Версия с useState при изменении threshold
// вызывала бы дополнительную перерисовку и возвращала бы правильное
// значение только после нее (асинхронно). Данная версия без лишних
// перерисовок и синхронная. React ¯\_(ツ)_/¯.

/** Возвращает меньше ли текущая ширина окна заданного порога. */
export const useIsSmallLayout = (threshold = 785) => {
  const isSmallLayout = Dimensions.get('window').width < threshold
  const lastValueRef = useRef(isSmallLayout)
  lastValueRef.current = isSmallLayout
  
  const forceUpdate = useForceUpdate()
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window}) => {
        const newValue = window.width < threshold
        if (lastValueRef.current !== newValue) {
          forceUpdate()
        }
      },
    )
    return () => subscription.remove()
  }, EMPTY_ARRAY)

  return isSmallLayout
}

// Утилиты

const EMPTY_ARRAY: any[] = []

const forceUpdateReducer = (i: number) => i + 1

/** Возвращает функцию для принудительного рендеринга компонента. */
export const useForceUpdate = () => {
  return useReducer(forceUpdateReducer, 0)[1]
}
```
</details>

-   Почему контекст для  `isSmallLayout`? Если использовать хук  `useIsSmallLayout`  напрямую из дочерних и родительских компонентов, то могут появиться баги из за разной очередности обновления и перерисовки, когда дочерний компонент обновляется раньше родительского, либо они могут использовать разные значения threshold.
    
-   Если нужно поддерживать больше размеров, можно возвращать не  `boolean`, а, например, тип  `'small' | 'medium' | 'large'`  или enum. Также можно добавить эти значения напрямую в `Theme`, без отдельного контекста. Адаптируйте подходы исходя из ситуации.
    
-   Реализацию  `useTheme`, возвращающую цветовую схему (dark / light) и палитру цветов, оставлю на читателе - она элементарна, и в общем то не всегда даже нужна. Вместо нее может быть  [useColorScheme](https://reactnative.dev/docs/usecolorscheme)  или ничего, если темная тема не поддерживается. Мой совет - использовать для подобных вещей  `React.Context`.
    

Немного порефакторим и сделаем удобный хук  `useStyles`, подписывающийся на  `isSmallLayout`  и  `Theme`:

```typescript
export const ListScreen = () => {
  const [styles, isSmallLayout, theme] = useStyles()
  
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      ...
    />
  )
}

const useStyles = makeUseStyles((isSmallLayout, theme) => {
  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContentContainer: {
      padding: isSmallLayout ? 8 : 16,
    },
  })
})
```

<details>
<summary>makeUseStyles</summary>

```typescript
/**
 * Создает хук, подключающийся к SmallLayoutContext и ThemeContext
 * и возвращающий мемоизированные стили, созданные с помощью styleCreator.
 * В отличие от useMemo, стили создаются не для каждого смонтированного
 * компонента, а один раз для всех.
 */
const makeUseStyles = <
  S extends StyleSheet.NamedStyles<S> | StyleSheet.NamedStyles<any>
>(styleCreator: (isSmallLayout: boolean, theme: Theme) => S) => {
  const getStyles = memoizeStyles(styleCreator)
  const useStyles = () => {
    const isSmallLayout = useSmallLayoutContext()
    const theme = useTheme()
    return [getStyles(isSmallLayout, theme), isSmallLayout, theme] as const
  }
  return useStyles
}
```
</details>

5.  Вместо создания оберток над компонентами или дублирования кода можно рассмотреть использование утилит для задания значений по умолчанию (например,  _fontFamily_) и генерации стилей текста, теней и т.п. Обертки увеличивают VDOM и вычисляют стили во время отрисовки, чем немного ухудшают производительность. Пример:
    

```typescript
const useStyles = makeUseStyles((_, {font, shadow, textShadow, colors}: Theme) => {
  return {
    container: {
      ...shadow(0, 6, 20),
      padding: 8,
      gap: 8,
    },
    label: {
      ...font(24, 29, '900'),
      ...textShadow(0, 2, 4),
      color: colors.text,
    },
  })
})
```

<details>
<summary>font, shadow, textShadow</summary>

```typescript
const FONT_WEIGHT_TO_FONT: {
  [key in NonNullable<TextStyle['fontWeight']>]: TextStyle['fontFamily']
} = {
  normal: 'Inter-Regular',
  bold: 'Inter-Bold',
  // ...и т.д.
}

export const font = (
  fontSize: number,
  lineHeight?: number,
  fontWeight: TextStyle['fontWeight'] = 'normal',
  fontFamily = FONT_WEIGHT_TO_FONT[fontWeight]
): Pick<
  TextStyle,
  'fontSize' | 'fontFamily' | 'fontWeight' | 'lineHeight'
> => {
  const style: TextStyle = {
    fontSize,
    fontFamily,
    fontWeight,
  }
  if (lineHeight !== undefined) {
    style.lineHeight = lineHeight
  }
  return style
}

// Данная утилита не обновлена под версию RN 0.76, где появилась
// поддержка boxShadow.
export const shadow = (
  xOffset: number,
  yOffset: number,
  radius: number,
  opacity: number = 0.5,
  color: ViewStyle['shadowColor'] = 'black',
  elevation?: number,
): Pick<
  ViewStyle,
  'shadowOffset' | 'shadowOpacity' | 'shadowColor' | 'shadowRadius' | 'elevation'
> => {
  return isAndroid ? {
    elevation: elevation ?? Math.max(Math.round(radius * 0.65), 1)
  } : {
    shadowOffset: { width: xOffset, height: yOffset },
    shadowOpacity: opacity,
    shadowColor: color,
    shadowRadius: radius,
  }
}

export const textShadow = (
  offsetX: number,
  offsetY: number,
  radius: number,
  color: TextStyle['textShadowColor'],
): Pick<TextStyle, 'textShadowOffset' | 'textShadowRadius' | 'textShadowColor'> => {
  return {
    textShadowOffset: {
      height: offsetY,
      width: offsetX,
    },
    textShadowRadius: radius,
    textShadowColor: color,
  }
}
```
</details>

Добавить данные утилиты в  `Theme`  при необходимости - несложная задача.

### 3. Картинки

#### 3.1. Web

Как известно, на мобильных устройствах нужно предоставить картинки двух размеров - с суффиксами @2x и @3x. Картинки без суффикса использовались на очень старых устройствах с до-retina экранами, и сегодня нигде не используются. Нигде, кроме веба. Да, по умолчанию там используются картинки без суффиксов, и даже в примере от expo при инициализации проекта есть такой "баг", из за которого в вебе плохое качество картинок.

Самое простое решение - класть картинку без суффикса такого размера, который вы хотите видеть в вебе. Например, можно скопировать @3x. Если веб не поддерживается - то картинки без суффикса не нужны.

По поводу что же лучше - PNG или SVG:

-   PNG растровый, и куда более производительный вариант по нагрузке на процессор. Приложения для платформ Apple оптимизированы для этого формата. Ему должен отдаваться приоритет.
    
-   SVG векторный, является более доступным - люди с плохим зрением часто масштабируют браузер, а они при этом не теряют в качестве. Поддерживает анимацию. Зачастую размер файла сильно меньше в зависимости от сложности картинки. Если браузер не поддерживается, а масштабирование и анимации не нужны, то смысла использовать практически нет. Требуется сторонняя зависимость  `react-native-svg`  и  [утилита](https://transform.tools/svg-to-react-native)  для конвертации.
    

#### 3.2. Генерация кода доступа

Из документации можно понять, что импортировать картинки нужно через  `require(<путь>)`  прямо из компонентов. Но это можно делать куда удобнее используя скрипт генерации кода доступа к ресурсам. Пример использования:

```typescript
<Image source={Images.navigation.back} />
```

<details>
<summary>scripts/generate-assets-access-code.ts</summary>

```typescript
// Генерирует код доступа для картинок в папке assets/images.

import fs from 'fs'
import path from 'path'

const ROOT_DIRECTORY = path.join(__dirname, '..')

// Генератор

const generateIndexFile = (
  directory: string,
  extensions: string[],
  ignore?: (filename: string) => boolean,
) => {
  const lines = [
    `// Autogenerated by ${path.basename(__filename)}

export const ${capitalize(path.basename(directory))} = {
`,
  ]
  appendLinesFromDirectory(lines, directory, directory, extensions, ignore)
  lines.push('} as const;\n')

  const destination = path.join(directory, 'index.ts')
  const content = lines.join('')
  fs.writeFile(destination, content, (error) =>
    console.log(error ?? `${path.relative(ROOT_DIRECTORY, directory)} generated successfully!`),
  )
}

// Утилиты

const appendLinesFromDirectory = (
  result: string[],
  rootDirectory: string,
  subDirectory: string,
  extensions: string[],
  ignore: Parameters<typeof generateIndexFile>[2],
  level = 1,
) => {
  fs.readdirSync(subDirectory).forEach((basename: string) => {
    const fullPath: string = path.join(subDirectory, basename)
    const stat = fs.statSync(fullPath)
    const { name, ext } = path.parse(basename)
    const indent = '  '.repeat(level)

    if (stat.isDirectory()) {
      result.push(`${indent}${formatName(basename)}: {\n`)
      appendLinesFromDirectory(result, rootDirectory, fullPath, extensions, ignore, level + 1)
      result.push(`${indent}},\n`)
      return
    }

    if (stat.isFile() && extensions.includes(ext) && (!ignore || !ignore(name))) {
      const propName = formatName(name)
      const relativePath = path.relative(rootDirectory, fullPath)
      result.push(`${indent}${propName}: require('./${relativePath}'),\n`)
    }
  })
}

const formatName = (name: string) => (isCapitalized(name) ? name : camelCase(name))

const isCapitalized = (input: string) => input.toUpperCase() === input

const camelCase = (input: string) =>
  input
    .split('-')
    .map((x, i) => (i ? capitalize(x) : x))
    .join('')

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1).toLowerCase()

// Генерируем код

generateIndexFile(
  path.join(ROOT_DIRECTORY, 'assets', 'images'),
  ['.png', '.jpg'],
  (filename) => filename.endsWith('@2x') || filename.endsWith('@3x'), // Используем только файлы без суффиксов
)
```
</details>

Этот же код можно использовать для генерации кода доступа к любым ресурсам, например к анимациям Lottie.

---

## Итоги

Как мы видим, адаптивная верстка и организация стилей в React Native без проблем делается встроенными средствами и несколькими простыми функциями. Любые библиотеки для этой задачи предлагаю считать  ~~говнокодом~~  неудачным архитектурным решением. Также хочу отметить, что данные подходы успешно применялись на практике - был опыт серьезного рефакторинга 7-летнего проекта для трех платформ, написанного в стиле "как не надо", после которого он без проблем прошел аудит доступности от компании Deque, включающий проверку адаптивности интерфейса.
