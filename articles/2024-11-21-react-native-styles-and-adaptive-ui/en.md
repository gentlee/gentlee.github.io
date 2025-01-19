---
title: 'Styles, themes, and <strong>adaptive layout</strong> in React Native'
date: '2024-11-21'
cover: 'cover.webp'
cover-alt: 'An image of adaptive layouts on various devices - from smartphones to computer screens, featuring a contented cat'
spoiler: 'This article will teach you how to effectively organize a crucial part of React Native development: managing styles and resources to create adaptive and accessible interfaces for three platforms: <b>iOS</b>, <b>Android</b>, and <b>Web</b>. We’ll also discuss whether libraries are necessary and explore the peculiarities of layouts and performance issues within the framework.'
---

![An image of adaptive layouts on various devices - from smartphones to computer screens, featuring a contented cat](/articles/2024-11-21-react-native-styles-and-adaptive-ui/cover.webp)

This article will teach you how to effectively organize a crucial part of React Native development: managing styles and resources to create adaptive and accessible interfaces for three platforms: <b>iOS</b>, <b>Android</b>, and <b>Web</b>. We’ll also discuss whether libraries are necessary and explore the peculiarities of layouts and performance issues within the framework.

For React Native, besides the standard `StyleSheet`, there are numerous libraries for styling interfaces, such as **NativeWind**, **Tamagui**, **Dripsy**, and **Styled Components**. Comparative [benchmarks](https://github.com/efstathiosntonas/react-native-style-libraries-benchmark) for these libraries are available online, showing a clear conclusion: all of them, to some extent, degrade performance, sometimes significantly. This is logically expected since most libraries compute styles at runtime, create wrappers around components, increase the virtual DOM, and execute more code overall, burdening the already overloaded JavaScript thread, responsible for rendering, data parsing, business logic, and handling user interactions.

With 8 years of experience and 13 projects in React Native alone, I can confidently say that overloading the JavaScript thread with unoptimized code and unnecessary tasks often negatively affects app responsiveness, especially on low-end Android devices. Non-optimized virtual DOM rendering and subsequent garbage collection are often the primary culprits of execution time delays. However, writing meaningful code can avoid performance issues.

Additionally, mindless addition of third-party libraries, especially native ones, often leads to various errors across a multitude of devices and operating systems, especially after these libraries or the framework are updated. The key principle in React Native (and software development in general) is: when you add a third-party dependency, you also add all its bugs (GitHub Issues) to your project. In the case of native libraries, multiply these bugs by the number of platforms.

But why use libraries for styling at all? Isn’t the built-in functionality of RN sufficient? Or is it just a habit of ~~inexperienced developers~~ beginners to pull dependencies into a project to solve trivial problems? While the React Native documentation lacks best practices for styling across themes and screen/window sizes, it’s actually quite simple to achieve, as I’ll soon demonstrate. Thus, it’s likely the latter.

## Objective

Create an adaptive and accessible interface for iOS, Android, and Web platforms, including desktops, tablets, and different screen orientations. The minimum supported window width is 320px.

## How NOT to Do It

> Why do non-native technologies have a worse reputation, even when they’re better? Because all problems can always be blamed on them. And that’s what regularly happens.

1. Many novice developers will **hardcode** various **global constants** like `isLargeScreen`, `isPhone`, `isTablet`, etc., and use them everywhere to compute styles, turning the code into a mess of unfixable layout bugs across screens and platforms. Static styles, of course, are not adaptive: changes in orientation, window sizes, and browser zooming won’t be supported. Ultimately, React Native will be blamed, not the developer or their manager.

2. The most "gifted" inexperienced developers will try **multiplying dimensions** like font sizes, padding, and element dimensions by some scale derived from dividing the screen size by a magic number. Such layouts, especially when combined with the first point, should be discarded entirely. Remember: **finger and eye sizes do not depend on screen size or resolution**, meaning button and font sizes shouldn’t either. Accessibility requirements state that interactive elements should not be smaller than 44 pixels, and fonts have their limitations too. Reducing spacing is acceptable, but more on that later. Also, note that React Native uses **logical pixels**, independent of screen pixel density, so additional scaling is unnecessary.

3. Others may choose to use **third-party libraries** for styling, sacrificing performance, multiplying bugs, and increasing the onboarding curve with poorly written documentation. Optimization and bug fixes will later require rewriting all components.

4. Globalizing font sizes and spacing constants/themes is rarely meaningful and often harmful. Across 30 mobile application projects using different technologies, I’ve never encountered a designer wanting to change all font sizes from 14 to 15 or all paddings from 16 to 18 globally. Overengineering like this has never been useful. Exceptions include: 1) standardized design systems where dimensions depend on window size, and 2) styles or values of similar components that must be identical. In these cases, exporting common styles or constants makes sense. Otherwise, hardcode and avoid complicating things.

5. Outer margins on components should not exist by default. If necessary, they should be passed via props like `style` or separate props. Where possible, use container properties like `gap`, `rowGap`, and `columnGap` to minimize `margin` usage. Maintaining code with default component margins overridden in various places is painful and prone to bugs.

Most of these problems are common to native mobile development as well.

## Best Practices

### 1. Basics

1. Remember that every app exists within a window. Screen size is irrelevant; window size matters.

2. Accessibility requirements for desktop sites mandate support for **400% zoom**. Supporting this automatically ensures mobile device compatibility since browser zooming simulates reducing screen width. Thus, we solve two problems at once.

3. Phones, tablets, desktops, and various orientations differ only in window width. Supporting different window widths inherently supports all device types and orientations. Tablets and phones in landscape mode are often identical to desktops, solving additional issues. Differentiating between touch and non-touch screens has not been practically necessary and won’t be covered here.

4. Flexbox, the only layout tool available out of the box, is powerful and rarely requires hardcoding platform, window size, or parent component specifics. If you lack understanding of its functionality, take some courses: `flexDirection`, `flex`, `flexGrow`, `flexShrink`, `flexWrap`, `gap`, `alignItems`, `justifyContent`, `minWidth`, `maxWidth`, etc., are must-knows.

### 2. Styles

It’s worth noting that the code snippets below are merely examples of different approaches, adaptable for specific projects. The key principle of development — **KISS** (Keep It Simple, Stupid) — should guide decisions, avoiding unnecessary code.

1. It’s better to keep styles in the same file as the component for three reasons: a) no need for folders for simple components, b) no extra imports or file-switching, and c) ESLint rules like `react-native/no-unused-styles` from `eslint-plugin-react-native` are supported. Unused styles in RN are common in practice. If a component becomes too large, splitting it or moving logic to utilities or hooks is more effective than relocating styles.

2. One way to compute styles is **dynamically in the render**, using state, props, `useWindowDimensions`, the current theme, etc., optionally wrapping them in `useMemo` (often unnecessary). Performance may slightly degrade as styles are created at least during the first render of **each** component and often on every render. Additionally, subscribing to screen size changes causes components to re-render with every window size change, potentially lagging during browser resizing. However, this isn’t a major issue. Suitable for styles dependent on unique component state or props, or when computations are minimal.

3. Another way is to **create static styles** for different variants, like `lightStyles` and `darkStyles`, and apply them based on system settings: `const styles = isDark ? darkStyles : lightStyles`. A good option for single Boolean dependencies, like light/dark themes. The downside is that it’s unsuitable for multiple dependencies. Also, more code executes at app launch, which could theoretically affect startup time (Hermes may optimize this, but it’s unclear).

4. The optimal approach is a **caching utility for global styles.** While `memoizeOne` can be used, it has type issues and slightly more code than the custom utility provided below. Styles are computed lazily only when dependencies change, such as switching between wide and narrow layouts or from light to dark themes, while components reuse memoized styles. The downside is ESLint rules from point one flagging errors (as of writing). Suitable for styles with globally unique dependencies, such as window size or theme, but not component state.

Here’s how it looks in code:

```typescript
// Regardless of how many components use these styles simultaneously,
// they are computed only once and recalculated only when
// isSmallLayout or theme changes.
const getStyles = memoizeStyles((isSmallLayout: boolean, theme: Theme) => {
  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContentContainer: {
      padding: isSmallLayout ? 8 : 16,
    },
  });
});
```

<details>
  <summary>memoizeStyles</summary>

```typescript
/**
 * Returns a function that provides memoized styles for
 * the last shallowly equal arguments. Creates new styles
 * with styleCreator if not memoized yet.
 */
export const memoizeStyles = <
  A extends unknown[],
  S extends StyleSheet.NamedStyles<S> | StyleSheet.NamedStyles<any>
>(
  styleCreator: (...args: A) => S
): ((...args: A) => S) => {
  let lastArgs: A;
  let style: S;
  return (...args: A) => {
    if (!style || !shallowEqualArrays(args, lastArgs)) {
      style = StyleSheet.create(styleCreator(...args));
      lastArgs = args;
    }
    return style;
  };
};

const shallowEqualArrays = (
  arrA: unknown[],
  arrB: unknown[]
): boolean => {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  const length = arrA.length;

  if (arrB.length !== length) {
    return false;
  }

  for (let i = 0; i < length; i += 1) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
};
```
</details>

Usage example:

```typescript
export const ListScreen = () => {
  // SmallLayoutProvider can be added to the root App component
  // and overridden for certain screens using withSmallLayoutContext if needed.
  const isSmallLayout = useSmallLayoutContext();
  const theme = useTheme();
  const styles = getStyles(isSmallLayout, theme);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      ...
    />
  );
};
```

<details>
  <summary>useSmallLayoutContext</summary>

```typescript
/** Returns whether the current window width is less than the threshold set in the Provider. */
export const useSmallLayoutContext = () => {
  return useContext(SmallLayoutContext);
};

export const SmallLayoutContextProvider: FC<PropsWithChildren<{ threshold?: number }>> = ({ children, threshold = 785 }) => {
  return (
    <SmallLayoutContext.Provider value={useIsSmallLayout(threshold)}>
      {children}
    </SmallLayoutContext.Provider>
  );
};

export const withSmallLayoutContext = <P extends PropsWithChildren>(
  Component: ComponentType<P>,
  threshold?: number
): ComponentType<P> => {
  const WithSmallLayoutContext: FC<P> = (props) => {
    return (
      <SmallLayoutContextProvider threshold={threshold}>
        <Component {...props} />
      </SmallLayoutContextProvider>
    );
  };
  return WithSmallLayoutContext;
};

// Hook

/**
 * Returns whether the current window width is less than the threshold.
 */
export const useIsSmallLayout = (threshold = 785) => {
  const isSmallLayout = Dimensions.get('window').width < threshold;
  const lastValueRef = useRef(isSmallLayout);
  lastValueRef.current = isSmallLayout;

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        const newValue = window.width < threshold;
        if (lastValueRef.current !== newValue) {
          forceUpdate();
        }
      },
    );
    return () => subscription.remove();
  }, EMPTY_ARRAY);

  return isSmallLayout;
};

// Utilities

const EMPTY_ARRAY: any[] = [];

const forceUpdateReducer = (i: number) => i + 1;

/** Returns a function to force component re-rendering. */
export const useForceUpdate = () => {
  return useReducer(forceUpdateReducer, 0)[1];
};
```
</details>

-   Why use context for `isSmallLayout`? Using the `useIsSmallLayout` hook directly in both child and parent components can cause bugs due to different update and re-render sequences. A child component might update before its parent, or they might use different threshold values.

-   If more size categories need to be supported, you can return not a `boolean`, but a type like `'small' | 'medium' | 'large'` or an enum. Alternatively, these values can be added directly to the Theme instead of using a separate context. Adapt approaches based on the situation.

-   The implementation of `useTheme`, which returns the color scheme (dark/light) and color palette, is left to the reader as it’s straightforward and not always necessary. Instead, you could use [useColorScheme](https://reactnative.dev/docs/usecolorscheme) or omit it entirely if dark mode isn’t supported. My advice is to use `React.Context` for such purposes.

Let’s refactor a bit and create a convenient `useStyles` hook that subscribes to both `isSmallLayout` and `Theme`:

```typescript
export const ListScreen = () => {
  const [styles, isSmallLayout, theme] = useStyles();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContentContainer}
      ...
    />
  );
};

const useStyles = makeUseStyles((isSmallLayout, theme) => {
  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContentContainer: {
      padding: isSmallLayout ? 8 : 16,
    },
  });
});
```

<details>
<summary>makeUseStyles</summary>

```typescript
/**
 * Creates a hook that connects to SmallLayoutContext and ThemeContext
 * and returns memoized styles created using styleCreator.
 * Unlike useMemo, styles are created once for all components,
 * not for every mounted instance.
 */
const makeUseStyles = <
  S extends StyleSheet.NamedStyles<S> | StyleSheet.NamedStyles<any>
>(styleCreator: (isSmallLayout: boolean, theme: Theme) => S) => {
  const getStyles = memoizeStyles(styleCreator);
  const useStyles = () => {
    const isSmallLayout = useSmallLayoutContext();
    const theme = useTheme();
    return [getStyles(isSmallLayout, theme), isSmallLayout, theme] as const;
  };
  return useStyles;
};
```
</details>

5.  Instead of wrapping components or duplicating code, consider using utilities for setting default values (e.g., _fontFamily_) and generating text styles, shadows, etc. Wrappers increase the VDOM and compute styles during rendering, slightly degrading performance. Example:

```typescript
const useStyles = makeUseStyles((_, { font, shadow, textShadow, colors }: Theme) => {
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
  };
});
```

<details>
<summary>font, shadow, textShadow</summary>

```typescript
const FONT_WEIGHT_TO_FONT: {
  [key in NonNullable<TextStyle['fontWeight']>]: TextStyle['fontFamily'];
} = {
  normal: 'Inter-Regular',
  bold: 'Inter-Bold',
  // ...etc.
};

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
  };
  if (lineHeight !== undefined) {
    style.lineHeight = lineHeight;
  }
  return style;
};

export const shadow = (
  xOffset: number,
  yOffset: number,
  radius: number,
  opacity: number = 0.5,
  color: ViewStyle['shadowColor'] = 'black',
  elevation?: number
): Pick<
  ViewStyle,
  'shadowOffset' | 'shadowOpacity' | 'shadowColor' | 'shadowRadius' | 'elevation'
> => {
  return isAndroid
    ? {
        elevation: elevation ?? Math.max(Math.round(radius * 0.65), 1),
      }
    : {
        shadowOffset: { width: xOffset, height: yOffset },
        shadowOpacity: opacity,
        shadowColor: color,
        shadowRadius: radius,
      };
};

export const textShadow = (
  offsetX: number,
  offsetY: number,
  radius: number,
  color: TextStyle['textShadowColor']
): Pick<TextStyle, 'textShadowOffset' | 'textShadowRadius' | 'textShadowColor'> => {
  return {
    textShadowOffset: {
      height: offsetY,
      width: offsetX,
    },
    textShadowRadius: radius,
    textShadowColor: color,
  };
};
```
</details>

Adding these utilities to `Theme` if necessary is a straightforward task.

### 3. Images

#### 3.1. Web

On mobile devices, you need to provide images in two sizes: with @2x and @3x suffixes. Images without a suffix were used on very old pre-retina devices and are not used today. Except for on the web. Yes, by default, the web uses images without suffixes. Even in the Expo example project, there is a "bug" leading to low-quality images on the web.

The simplest solution is to place an image without a suffix at the size you want to see on the web. For example, copy the @3x version. If the web isn’t supported, then suffix-less images aren’t needed.

Regarding PNG vs. SVG:

-   PNG is raster and much more efficient in terms of CPU load. Apps for Apple platforms are optimized for this format, and it should be prioritized.

-   SVG is vector and more accessible—users with poor vision often zoom their browsers, retaining quality. It supports animation and often has a much smaller file size depending on the image’s complexity. If the browser isn’t supported, and scaling/animations aren’t needed, there’s little point in using it. A third-party dependency, `react-native-svg`, and a [tool](https://transform.tools/svg-to-react-native) for conversion are required.

#### 3.2. Generating Access Code

Documentation suggests importing images via `require(<path>)` directly in components. However, this can be done more conveniently using a script to generate access code for resources. Example usage:

```typescript
<Image source={Images.navigation.back} />
```

<details>
<summary>scripts/generate-assets-access-code.ts</summary>

```typescript
// Generates access code for images in the assets/images folder.

import fs from 'fs';
import path from 'path';

const ROOT_DIRECTORY = path.join(__dirname, '..');

// Generator

const generateIndexFile = (
  directory: string,
  extensions: string[],
  ignore?: (filename: string) => boolean
) => {
  const lines = [
    `// Autogenerated by ${path.basename(__filename)}

export const ${capitalize(path.basename(directory))} = {
`,
  ];
  appendLinesFromDirectory(lines, directory, directory, extensions, ignore);
  lines.push('} as const;\n');

  const destination = path.join(directory, 'index.ts');
  const content = lines.join('');
  fs.writeFile(destination, content, (error) =>
    console.log(error ?? `${path.relative(ROOT_DIRECTORY, directory)} generated successfully!`)
  );
};

// Utilities

const appendLinesFromDirectory = (
  result: string[],
  rootDirectory: string,
  subDirectory: string,
  extensions: string[],
  ignore: Parameters<typeof generateIndexFile>[2],
  level = 1
) => {
  fs.readdirSync(subDirectory).forEach((basename: string) => {
    const fullPath: string = path.join(subDirectory, basename);
    const stat = fs.statSync(fullPath);
    const { name, ext } = path.parse(basename);
    const indent = '  '.repeat(level);

    if (stat.isDirectory()) {
      result.push(`${indent}${formatName(basename)}: {\n`);
      appendLinesFromDirectory(result, rootDirectory, fullPath, extensions, ignore, level + 1);
      result.push(`${indent}},\n`);
      return;
    }

    if (stat.isFile() && extensions.includes(ext) && (!ignore || !ignore(name))) {
      const propName = formatName(name);
      const relativePath = path.relative(rootDirectory, fullPath);
      result.push(`${indent}${propName}: require('./${relativePath}'),\n`);
    }
  });
};

const formatName = (name: string) => (isCapitalized(name) ? name : camelCase(name));

const isCapitalized = (input: string) => input.toUpperCase() === input;

const camelCase = (input: string) =>
  input
    .split('-')
    .map((x, i) => (i ? capitalize(x) : x))
    .join('');

const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1).toLowerCase();

// Generate code

generateIndexFile(
  path.join(ROOT_DIRECTORY, 'assets', 'images'),
  ['.png', '.jpg'],
  (filename) => filename.endsWith('@2x') || filename.endsWith('@3x') // Use only files without suffixes
);
```
</details>

This same code can be used to generate access code for any resources, such as Lottie animations.

---

**Conclusion**

As we can see, adaptive layouts and style organization in React Native are easily handled using built-in tools and a few simple functions. Any libraries for this purpose should be considered ~~poor code~~ an unfortunate architectural decision. Moreover, these approaches have been successfully applied in practice—a significant refactor of a 7-year-old, three-platform project written in "how not to do it" style passed an accessibility audit by Deque, which included adaptive interface checks.

