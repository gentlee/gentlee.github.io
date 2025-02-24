---
title: 'OOP: <strong>the worst</strong> thing that happened to programming'
date: '2025-02-24'
cover: 'cover.webp'
cover-alt: 'The image shows what it would be like if buildings were constructed the same way code is written. Elderly people ask their grandson to build a toilet, and end up with an ugly, monstrous construction, while the grandson is pondering that perhaps the classes should have been inherited differently. In his hands, he holds a banana, surrounded by jungle and several monkeys. The Java logo is on the building.'
spoiler: 'In this article, we will try to understand why OOP is the worst thing that happened to programming, how it became so popular, why experienced Java (C#, C++, etc.) programmers can’t really be considered great engineers, and why code in Java cannot be considered good.'
---

![The image shows what it would be like if buildings were constructed the same way code is written. Elderly people ask their grandson to build a toilet, and end up with an ugly, monstrous construction, while the grandson is pondering that perhaps the classes should have been inherited differently. In his hands, he holds a banana, surrounded by jungle and several monkeys. The Java logo is on the building.](/articles/2025-02-24-oop/cover.webp)

In this article, we will try to understand why OOP is the worst thing that happened to programming, how it became so popular, why experienced Java (C#, C++, etc.) programmers can’t really be considered great engineers, and why code in Java cannot be considered good.

Unfortunately, programming is quite far from being a science (just like me), so many terms can be interpreted differently. Let’s first define them. I should warn you that these definitions are my subjective opinion, an attempt to bring order and fill in the gaps. Constructive criticism is welcome.

### Definitions

- **[Data] structure** — pure data that does not contain any processing logic (functions).
- **Function** — a block of code that performs a specific logic. It can return a value.
- **Procedure** — a block of code that performs a specific logic but does not return a value. I suggest we consider this concept a subset of a function and remove it from common usage, while adding the definition of procedural style.
- **Object** — an entity that contains both data and functions to process them — methods. An object can be imitated in FP by placing data and functions in the same structure. In classical OOP, this is always an instance of a class.
- **Class** — a blueprint for creating objects, defining their data and methods. The foundation of OOP.
- **Method** — a function that is part of a class. Instance methods (non-static) have an implicit reference to the object itself (`this`, `self`), with all its data and methods, which is essentially a forced hidden first argument.
- **Functional programming (FP)** — programming using structures and functions. Do not confuse with functional style.
- **Object-oriented programming (OOP)** — programming using classes, objects, and all their features — inheritance, encapsulation, polymorphism, etc. If desired, one can mimic structures using classes [almost] without methods and functions with static methods in static classes.
- **Mutable style** — a programming style where data is typically changed in place rather than copied. This can be used in both FP and OOP, but it is characteristic of OOP.
- **Immutable style** — a programming style where data is typically NOT changed in place but new copies are created. This can be used in both FP and OOP, but it is not characteristic of OOP.
- **Math-functional (often - just functional) style** — a style of FP that features immutable style and pure functions — functions that always return the same result for the same arguments (in simple terms — they do not use external state), which is typical for mathematical functions (do not confuse with functions in programming).

#### Common Objections

1. OOP was originally designed as <something else>.
    - I don't see any point in discussing someone's long-forgotten fantasies; I base my argument on where we've ended up.
2. Functional and procedural programming are different things.
    - I often see FP being used when people actually mean PP, and I rarely encounter PP itself. The concept of a procedure is almost never used anymore, whereas the function is constantly used, likely due to keywords in popular languages like `function` or `func`. At the same time, I frequently encounter the term "functional style," so I decided to separate the concepts of paradigms and programming styles. I also try to avoid unnecessary concepts in this article, such as imperative and declarative styles.

### Drawbacks

The first red flag that made me question the success of the OOP concept was a ~~childhood trauma~~ task from my first OOP interview for a language I had just started learning at the time — C#, which has stayed in my memory to this day:

<details>
  <summary>Task: What will be printed to the console when the program is run?</summary>

```csharp
class Base
{
    static Base()
    {
        Console.WriteLine("Static Base");
    }

    public Base()
    {
        Console.WriteLine("Instance Base");
    }
}

class Program : Base
{
    public static readonly Program Instance;

    static Program()
    {
        Console.WriteLine("Static Program");
        Instance = new Program();
    }

    private Program()
    {
        Console.WriteLine("Instance Program");
    }

    static void Main()
    {
        Console.WriteLine("Main");
    }
}
```
</details>

The first thought at the time was — how and why did the human mind come up with something like this — a program creates itself (what? o_0) from its own method, and then even darker magic begins — many other methods are called in a sequence that is almost impossible to predict without knowing this magic from the inside.

But that was just the beginning — next could have followed questions about the Singleton pattern and thread-safety of the program instance initialization via the static constructor, but we didn't get that far. And as it turned out later, even this code wasn't OOP enough — there are no factories or dependency injection containers.

At the time, though, I took it all with the mindset of "maybe it’s needed for some reason," and I didn’t have the competence to stop studying C# just yet. After failing the interview, I began delving deeper into the OOP jungle, gradually getting closer to the thought that "no, not needed."

By the way, here's the equivalent of the previous code in FP with TypeScript:

```typescript
console.log("Main")
```

To understand how good of an idea OOP really is, it's enough to analyze all the points that differentiate it from FP and compare their pros and cons. But in the end, the main difference is one — classes. So, let’s start the analysis with the features of classes.

The following OOP examples will be written in either C# or TypeScript. The FP example will be in TypeScript.

#### Methods

A simple example:

```typescript
// Class
class User {
  firstName: string
  lastName?: string
  middleName?: string
  ... // other fields not needed for getDisplayName

  constructor(firstName: string, lastName?: string, middleName?: string) {
    this.firstName = firstName
    this.lastName = lastName
    this.middleName = middleName
  }

  // Method
  getDisplayName() {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(" ")
  }
  
  ... // other methods not needed for getDisplayName
}

// Function
const getDisplayName = (user: {firstName: string, lastName?: string, middleName?: string} | null | undefined) => {
  if (!user) return undefined

  return [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
}

// Even more flexible, but may be less convenient
const getDisplayName = (firstName: string, lastName?: string, middleName?: string) => {
  ...
}
```

How do the method and function `getDisplayName` differ?

**First**, the method is tightly coupled with the type of its hidden argument — `this`, which is `User`. It depends not on the interface, but on the specific class. This leads to several problems:
- **The necessity of using classes**: You can't use the method without creating an instance of the class via `new`, for example, by creating a dictionary with the same fields.
- **Reuse with other types**: The method requires not just the data it needs to work with, but also everything else that's part of the `User` class — all the fields and methods. To use this method with a type other than `User`, the only way is inheritance, which is a huge drawback (more on this later). Without inheritance, you can't reuse the method.
- **Inability to handle situations where user is `null` or `undefined`**.

In JS/TS, you could of course hack this through `call`/`apply`, but these are hacks specific to the language, go against KISS, and are themselves a sign of bad code.

```typescript
// OOP

let user: User | null
user.getDisplayName() // Error: null reference

({firstName: "Alexander"}).getDisplayName() // Error: object has no such method

// FP

getDisplayName({firstName:"Alexander"}) // Alexander

getDisplayName(new User("Alexander", "Danilov")) // Alexander Danilov

const dog: Dog  = {
  firstName: "Charlie",
  color: "black"
}
getDisplayName(dog) // Charlie

getDisplayName(undefined) // undefined
```

Clearly, there are strong limitations when it comes to reuse, and it provokes bugs and worse programming practices.

In FP, the function's argument type is an interface containing only the necessary fields.

**The second** difference — method overriding. In some languages, there are several ways to override a method in a derived class, and in general, to forbid overriding. The person who came up with this obviously thought that there weren't enough ways to shoot oneself in the foot in OOP. Here's an example in C#:


```csharp
public void GetDisplayName() // Cannot be overridden in subclasses.

public virtual void GetDisplayName() // Can be overridden.

public override void GetDisplayName() // Overriding the method in the subclass.

public sealed override void GetDisplayName() // Overriding the method in the subclass, but in future subclasses it cannot be overridden.

public new void GetDisplayName() // The wildest — the method called depends on the reference type it’s called on (facepalm). If it’s the parent type, the parent method will be called; if it's the type of instance with `new`, the method of that instance will be called.
```

Method overriding equivalent in FP:

```typescript
const getUserDisplayName = (user: ...) => {...}

const getAdminDisplayName = (admin: ...) => {
  if (...) {
    // In certain cases, reuse getUserDisplayName.
    return getUserDisplayName(admin) 
  }

  // Some unique logic for admin's name display.
  return ...
}
```

Everything is as simple as it can be.

##### Conclusion:

It turns out that methods lose to functions in every way, except for one small thing related exclusively to development environments and the notation of their calls (we’ll discuss this at the very end), and they also provoke worse programming practices, adding more opportunities to "shoot yourself in the foot" for no good reason. So, methods are garbage. Let’s move on.

#### Inheritance

Regarding this feature, even among OOP developers, there’s a well-established rule — inheritance is an anti-pattern, and delegation should be preferred.

Why? Because, first of all, you can’t inherit specific fields or methods — only the whole class. This problem even has its own name — **The banana and gorilla problem** by Joe Armstrong: you wanted a banana, but it gave you a gorilla holding the banana and the entire jungle.

Secondly — in most languages, you can only inherit from one class.

Example:

```typescript
// OOP

class User {
  id: string
  name: string
  surname: string
  address: string
  friends: User[]

  constructor(name: string, surname: string, address: string, friends: User[]) { … }

  getDisplayName() { … }

  hasFriend(id: string) { … }
}

// Bad: inheritance
// Npc shouldn't have address, friends, and hasFriend

class Npc extends User {
  constructor(name: string, surname: string) {
    super(name, surname, "", []) // We are forced to provide fields we don't need
  }
}

// Bad: modifying the original code and breaking it into smaller classes

class Nameable {
  name: string
  surname: string

  getDisplayName() { … }
}

class Friendable {
  friends: User[]
  hasFriend(id: string) { … }
}

// How to construct User without multiple inheritance? Delegation?
// Which class to inherit from and which to embed (delegate)? Or should we avoid inheritance altogether and embed both?
// Does anyone like this code? (rhetorical question)
class User {
  nameable: Nameable
  friendable: Friendable
}
```

What we have:

To reuse something from an existing class, you either have to take everything it contains or rewrite the existing code and extract parts into other classes. But even in such cases, without multiple inheritance, it's impossible to properly construct classes.
Multiple inheritance brings even more problems, and many popular OOP languages have abandoned it.

```typescript
// FP

type BaseUser = {
  id: string
  name: string
  surname: string
}

// Union instead of inheritance.
type User = BaseUser & {
  address: string
  friendIds: string[]
}

// Alias.
type Npc = BaseUser

// Option without BaseUser. Even the base type isn't always needed — you can pick fields from another type.
type Npc = Pick<User, "id" | "name" | "surname">

// We specify only what’s needed in the function, not even BaseUser, but only friendIds.
const hasFriend = (friendIds: string[], friendId: string) => { … }

hasFriend(user.friendIds, "123") // OK: user has the User type, which includes friendIds.
hasFriend(npc.friendIds, "123") // Error: npc has the Npc type, which does not have friendIds.
```

As we can see, the most correct option is to use not inheritance, and not even delegation, but composition of types (in TypeScript - union type, `Pick`, `Omit`, etc.). And if the structure contains all the fields necessary for calling a function, then there are no restrictions on calling that function.

Conclusion: inheritance adds many problems but solves none. Garbage, even by OOP standards.

#### Polymorphism

Polymorphism is the ability of a function to handle data of different types.

Classical polymorphism in OOP is implemented through inheritance in the worst case (where we encounter all the previously mentioned problems), and through interfaces in the best case — yet another OOP dilemma. With interfaces, the code won't depend on the specific implementation, but then you have to figure out where to store the default method implementations. And, of course, in both cases, there's a downside — the necessity of using classes (see the previous points).

```csharp
using System;
using System.Collections.Generic;

// Abstract class.
abstract class Shape
{
    public abstract double GetArea();
}

// And/or interface.
interface IShape
{
    double GetArea();
}

class Circle : Shape
{
    public double Radius { get; }

    public Circle(double radius)
    {
        Radius = radius;
    }

    public override double GetArea()
    {
        return Math.PI * Radius * Radius;
    }
}

class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public override double GetArea()
    {
        return Width * Height;
    }
}

// Factory for creating shapes from raw data.
class ShapeFactory
{
    public static Shape CreateShape(Dictionary<string, object> rawData)
    {
        if (!rawData.ContainsKey("type")) return null;

        string type = rawData["type"].ToString() ?? "";

        switch (type)
        {
            case "circle":
                if (rawData.TryGetValue("radius", out var radiusObj) && radiusObj is double radius)
                    return new Circle(radius);
                break;

            case "rectangle":
                if (rawData.TryGetValue("width", out var widthObj) && widthObj is double width &&
                    rawData.TryGetValue("height", out var heightObj) && heightObj is double height)
                    return new Rectangle(width, height);
                break;
        }

        return null; // Unknown type
    }
}

class Program
{
    static void Main()
    {
        var rawShapes = new List<Dictionary<string, object>>
        {
            new Dictionary<string, object> { { "type", "circle" }, { "radius", 5.0 } },
            new Dictionary<string, object> { { "type", "rectangle" }, { "width", 4.0 }, { "height", 6.0 } },
        };

        // First, we need to transform the raw data into the appropriate class instances using ShapeFactory.
        var shapes = rawShapes.ConvertAll(ShapeFactory.CreateShape);

        LogShapes(shapes);
    }

    static void LogShapes(List<Shape> shapes)
    {
      foreach (var shape in shapes)
      {
          Console.WriteLine($"Area: {shape.GetArea()}");
      }
    }
}
```

In FP, parametric (true) polymorphism is used:

```typescript
type Circle = { type: "circle"; radius: number }
type Rectangle = { type: "rectangle"; width: number; height: number }
type Shape = Circle | Rectangle

const getArea = (shape: Shape): number => {
  // Make sure the ESLint rule @typescript-eslint/switch-exhaustiveness-check, requiring exhaustive switch blocks, is enabled.
  // This code is fully typed and checked by the compiler.
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius * shape.radius
    case "rectangle":
      return shape.width * shape.height
  }
}

// In the code of a single project, it's better to use the Shape type and the getArea implementation to avoid complicating the code.
const logShapes = (shapes: Shape[]) => {
  shapes.forEach(shape => console.log(`Area: ${getArea(shape)}`))
}

// Using raw data without unnecessary transformations.
logShapes([
  { type: "circle", radius: 5 },
  { type: "rectangle", width: 4, height: 6 },
])

// In a library, the function can be made more flexible by using generics and a getArea argument (which can be
// optional with a default implementation), and it doesn't care what type is provided.
const logShapes = <T,>(shapes: T[], getArea: (shape: T) => number) => {
  shapes.forEach(shape => console.log(`Area: ${getArea(shape)}`))
}

logShapes(
  [
    { type: "circle", radius: 5 },
    { type: "rectangle", width: 4, height: 6 },
    { type: "triangle" }, // Compilation error: this type is not supported by getArea.
  ],
  getArea
)
```

**Conclusion:** As we can see, polymorphism in FP is perfectly implemented without classes and all their drawbacks, and the code is simpler and more concise, even in traditional OOP examples. In real projects, when it's much more complex, and as the codebase grows, the difference only becomes more pronounced.

#### Encapsulation

Here, I'll quickly go over the analogs of `private`, `public`, etc., for classes in TypeScript for FP:

```typescript
// The function is "public" because it is exported.

export const getDisplayName = () => …

// Not exported — accessible only within the file.

const capitalize = () => …

// Storing private data using closures.

const makeAccount = () => {
  const balance = 0
  return {
    deposit: (amount: number) => {
      if (amount < 0) { throw … }
      balance += amount
    },
    …
  }
}

// Hiding fields using a private type.

export type State = … // Public type, exported.
type PrivateState = … // Private type.

const reducer = (state: State) => {
  const privateState = state as PrivateState // PrivateState type contains private fields.
  // Working with state using private fields.
}

// Making fields read-only by casting to a type, ensuring compile-time checks.

const readonlyArray = ["John"] as const
readonlyArray[0] = "Peter" // Compilation error.

// Using an immutable type with both runtime and compile-time checks.

const freezedArray = Object.freeze(["John"])
freezedArray[0] = "Peter" // Compilation error. If executed, it will also fail at runtime.
```

#### Encapsulation

As we can see, there are no problems with encapsulation in FP, and all scenarios are quite simply implemented without the need for additional symbols like access modifiers. However, it is worth noting that encapsulation is often not only unnecessary but can even be harmful — it increases the amount of code, complicates testing, and slows application performance.

**Conclusion:** OOP does not implement encapsulation any better than FP.

---

With the main differences covered, let's take a look at some typical problems that often arise from using OOP:

#### Design Patterns

In OOP, a large number of patterns with fancy names were invented, many books have been written about them, and they are frequently asked about in interviews. But, in reality, OOP design patterns are just workarounds that "heroically" solve one of the problems inherent in OOP (for example, the _Decorator_ pattern extends a class when inheritance is not available), and even then, only partially, as it is impossible to fully solve the architectural problems OOP introduces.

In FP, knowing these two techniques — 1. add an argument to a function; 2. wrap a function in another — you already know all the main patterns.

#### Constructors

In most OOP languages, you are constantly required to implement constructors with typical boilerplate code. In FP, this is a rare occurrence because data is separated from logic, and in most cases, creating an entity of any type is simply creating standard data structures like strings, arrays, or associative arrays:

```typescript
type User = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  friendIds?: string[]
}

// There's no need to create a constructor function.
// The compiler will point out any issues if the provided field types don't match.
const user: User = {
  id: "1",
  firstName: "Alexander",
  lastName: "Danilov",
  friendIds: ["2"]
}
```

Moreover, the next point is that it turns out that using constructors in OOP is an anti-pattern.

#### Containers and Dependency Injection

Unlike in FP, where most code resides in functions that are typically just exported and imported, in OOP, a large portion of the code is in non-static classes that need to be initialized. To address such inherent issue in OOP and initialize class objects in a way that's convenient and flexible beyond any real need, dependency injection containers were introduced. In short — it turns out that using constructors is an anti-pattern (doesn't it always seem that way in OOP?). Sooner or later, you will have to pass all dependencies to all class instances, which is why it’s better to pass a single dependency container and initialize objects only through it. 

Moreover, should a class even know that it is a singleton? For perfect flexibility, of course not. What if someone someday wants to make a singleton not a singleton? This has never happened in history, but why not write even more code, making it even more complicated?

In FP, it’s true that there can be situations when a function has too many arguments, and it might be helpful to bind some of the functions with their arguments (dependencies), but this is done only when necessary.

```typescript
// Most of the code is stored in stateless functions that don't require initialization, singletons, or dependency injection containers.
export const getDisplayName = ...

// Singleton is simply an exported initialized entity, without the need for a static instance initialization hack.
export const store = createStore(...)

const main = () => {
  // If importing the store is not suitable, we can import the createStore function.
  const store = createStore()

  someWork(store)
  
  // If we don't want to pass the store through arguments later, we can use closures, for example.
  const someWorkWithStore = () => someWork(store)
  
  // Now we use it without passing the store.
  someWorkWithStore()
}
```

Testability is not an issue here — any import in TypeScript can be easily replaced in tests without any problems.

#### Serialization and Copying

Since in FP data is separated from logic and is primarily either primitive type or composed of primitives, it is usually serializable by default. It can also be shallowly or deeply copied without any extra code:

```typescript
const user: User = {
  id: "1",
  firstName: "Alexander",
  lastName: "Danilov",
  friendIds: ["2"]
}

// Shallow copy with updated and added fields.
const updatedUser: User = {
  ...user,
  firstName: "Alex",
  middleName: "Alexandrovich", // Providing an optional field.
}

// Deep copy.
const clonedUser: User = structuredClone(user)

// Serialization to JSON.
const userJson: string = JSON.stringify(user)

// Deserialization from JSON.
const parsedUser: User = JSON.parse(user)
```

In OOP languages, it is often necessary to implement serialization and cloning functions in each individual class, which affects both the development speed and the bug-proneness of the code.

#### Working with Arrays

A class contains both data and methods to manipulate it. Following this logic, developers often write methods for working with, for example, `User` inside the `User` class, which may seem logical. But what if, in the future, we need to work with multiple users?

```typescript
class User {
  update() {
    service.updateUser(this.id, ...) // E.g. here goes long async IO operation.
  }
}

// Is it correct to update an array of users like this?
// What should a beginner OOP developer come up with here?
for (let user of users) {
  user.update()
}
```

This often leads to a mess of patterns and workarounds like batching to optimize this into a single request instead of many.

A simple solution in FP is to write the code to handle both arrays and individual objects:

```typescript
const updateUsers = (data: User | User[]) => {
  const users = Array.isArray(data) ? data : [data]

  // Now work with the array, sending one request.
}
```

#### Multiple Models

This problem can be observed in the section about polymorphism — OOP encourages creating a separate domain model, different from the one used for data transfer, such as from the backend. The data comes serialized in a specific format, while in OOP, everything must be contained within classes with methods.

In FP, it is also possible to use a custom model, but in many cases, transforming data is either unnecessary or minimal because the data is "dumb" and serializable in both cases. The need for a separate domain model for the application rarely arises, and the backend model is often used directly up to the UI layer, ideally auto-generated.

Someone might argue that this isn't flexible and that changes in the backend model would require rewriting the application code. But in reality, it would need to be rewritten in both cases, and with a separate model, technical debt starts to accumulate if not addressed immediately. What OOP developers do is essentially overengineering. Moreover, changing several fields in the application code is done through refactoring in an IDE in seconds, compared to writing thousands of lines of unnecessary code.

#### Concurrency and Multithreading

A huge advantage of the mathematical style of FP is the support for concurrency without additional effort and synchronization. In OOP, it's common to work in a mutable style, which leads to the need to write very complex and error-prone synchronization code for data access. In a [recent article](/en/articles/serial-queues), I even wrote that, to this day, most programmers, including creators of popular programming languages, still struggle with this.

### Conclusions

As we can see, OOP not only fails to solve any problem better than FP, but it also introduces a multitude of other issues, which are completely unsolvable with any "design patterns" or workarounds. It requires knowledge and usage of an enormous number of such patterns, many of which even prohibit the use of basic class features like constructors or inheritance. Many OOP developers have either forgotten why they do all this or never knew, diving straight into the framework's intricacies and doing it "because it's the norm". In the end, we have far more ugly, overcomplicated code, which can be succinctly described as "a monstrous collection of crutches."

##### Did anyone notice these drawbacks in early years of OOP language development?

- Many programming giants, like Linus Torvalds, quickly came to a similar conclusion, and the latter banned the use of C++ in the Linux kernel.
- Even the creator of Java later admitted that adding classes was a mistake.

However, there were those who gained incredible popularity by describing the principles and patterns of OOP. One of the most famous programmers, who is also an exceptionally poor coder, is Robert Martin with his SOLID principles and the book *Clean Code*. [In this article](https://habr.com/ru/articles/875426/), you can evaluate how bad "clean" code by this "guru" of Java looks compared to a simple function in TypeScript and draw clear conclusions.

### Why Is It So Popular?

There is still some sense, considering how many OOP languages there are today and how many developers use them, that the popularity of OOP isn't just based on Oracle's massive advertising campaign for Java in the past, or the fact that 99% of people ~~are idiots~~ have IQs below 140. And indeed, there is one "advantage" — **Autocomplete** — the ability to see which functions can be called with a specific data type is so convenient that most people are willing to tolerate all the other shortcomings (in most cases, not even realizing them — see the point about 99% of people).

But the thing is, autocomplete for dot notation is not a feature of the language or even the programming paradigm. It is a 100% feature of specific IDE. But didn’t FP developers think of creating something similar? Surprisingly (as far as I know), this feature was not available for functional languages for a long time. For example, in Haskell, there is a site called [Hoogle](https://hoogle.haskell.org/) to search for functions by name or approximate signature, but it’s one thing to see it in an IDE in a fraction of a second and another to go to a website. Requiring developers to memorize thousands of functions for all types instead of providing a convenient suggestion is a serious drawback when using FP in most popular IDEs.

Today, of course, there are VS Code plugins for Haskell and other languages that make it easy to search for functions by providing one or even several parameters from the function's signature. However, in the same VS Code, by default, this functionality is not available for JS or TS (together the most popular programming languages).

We could also discuss method calls with dot notation, which first appeared in Smalltalk in the 1970s and was later adopted by most modern languages. It’s this notation that triggers two ways to call functions — with a dot, where the first argument is passed in a way different from the others, and without a dot, where all arguments are passed in the same way.

The very fact of having two ways to do the same thing is already a sign of poor architecture and additional headaches for the developer, creating room for bad decisions.

The same applies to parentheses — initially, it was a rather poor decision, as multiple calls in a row are hard to read, and it's precisely these that make autocompletion for arguments in functional programming inconvenient, without the dot notation.

```typescript
thirdCall(c, secondCall(b, firstCall(a)))
```

In such cases, it's common to see implementations of method chaining by returning objects, but this is just another hack and another way to do the same thing differently:

```typescript
firstCall(a)
  .secondCall(b)
  .thirdCall(c)
```

The question of what to replace method calls using dots and parentheses for arguments with, I suggest we discuss in the comments.

Which language would I like to highlight from the modern and popular ones, in which many of the mentioned problems are solved?

- **Go** completely lacks classes, although it has interface methods that can be called using a dot. I believe the creators of the language wanted it to become as popular as possible, so they decided to leave this flaw to not scare off all the Java developers right away.
- **TypeScript** — today, you can write large applications in it without using classes at all, and almost all the unnecessary stuff can be turned off via a linter. It is one of the most convenient languages for FP, including in terms of typing capabilities — one of the most flexible and strict, leaving Java, C#, and others a decade behind.
- Of course, **C** — the father of all C-like languages, free from the flaws of its maimed OOP descendant, is still relevant today.

---

### Conclusion

I am absolutely sure that a person writing commercial code in a purely OOP language for more than 3-4 years, who hasn't noticed many of its problems and hasn't started thinking about transitioning or switching to FP — cannot be considered a skilled engineer. A true engineer always thinks about the simplest solutions, notices flaws and complexities, and cannot miss such a log in the eye.

Development environments, unfortunately, even today, in 2025, are heavily tuned for OOP and do not encourage FP, and for several decades have been provoking the worst programming practices. The culprits are companies like Microsoft and JvmBrains — some of the creators of those very maimed OOP languages and development environments. Also, these companies, along with Apple and Google, continue to create OOP languages like Swift, Dart, Kotlin. And it's not only that modern programming is far from being a science — the creation of modern languages is done by people who are far from it, so the situation won't improve anytime soon.

But there is progress, and even OOP languages are gradually incorporating functional practices, and there are already languages that are almost free from the listed problems.

### Advice

..from someone who has been writing code without classes for many years: use languages that do not have classes (Go), avoid classes if possible (TypeScript, Python), and avoid languages where classes are the core (Java, C#, C++ and others). Write functional code - as simple code as possible.
