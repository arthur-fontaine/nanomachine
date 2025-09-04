---
title: Implement States
description: Learn how to define a state machine's behavior using the implement method.
outline: deep
---

# Implement States

As outlined in the [Create a State Machine](./create-state-machine.md) guide, after defining the context, events, and states of your state machine, the next step is to implement the behavior of each state using the `implement` method.

Let's explore your options.

### `guard`

```ts
state.guard((ctx) => ctx.count >= 0, "fallbackState")
```

The `guard` method prevents state transitions based on the current context. You provide a predicate function to check the context. If the function returns `false`, the state machine transitions to the specified fallback state without executing any further handlers in the current state.

### `guardContext`

```ts
state.guardContext("count", (c) => c !== undefined, "fallbackState")
```

The `guardContext` method is a specialized version of `guard` that targets a specific context key. It alters the context type for subsequent handlers in the state. The function you provide should be a type predicate (*e.g.*, `c is number`).

```ts
// Admits the context type is `{ count: number | undefined }`
state
  .guardContext("count", c => c !== undefined, "fallbackState") // Following handlers' context type is automatically narrowed to `{ count: number }`
  .onEntry((ctx) => {}) // ctx.count is number, not number | undefined
```

### `localEvent`

```ts
state.localEvent<'decrement', [number]>()
```

The `localEvent` method lets you define events specific to the current state. These events cannot be emitted or handled outside this state. To manage these events, use the [`onReceive`](#onreceive) method.

### `onEntry`

```ts
state.onEntry((ctx, set, emit) => {
  console.log("Entering state with context:", ctx);
  set({ count: ctx.count + 1 }); // Update context
  emit("increment", 1); // Emit an event
})
```

The `onEntry` method defines a function that executes whenever the state machine enters the specified state, except when a guard has been triggered. This function allows you to access and modify the context, as well as emit events that the [`onReceive`](#onreceive) method will handle.

### `onReceive`

```ts
state.onReceive({
  increment: (ctx, set, by) => {
    set({ count: ctx.count + by });
    return "counting"; // Transition to counting state
  },
})
```

The `onReceive` method lets you define how the state machine responds to events while in the current state. You provide an object where the keys are event names and the values are their corresponding handler functions.

Each handler function can read and modify the context. It will also receive the event payload, if any. If the function returns a string, the state machine transitions to the state with that name. If it returns `undefined` or `false`, it remains in the current state.

> [!TIP]
> Note that the return type of the handler functions is typed according to the states you defined earlier.

### `after`

```ts
state.after(2_000, "counting")
```

The `after` method sets up a timed transition to another state. It accepts a duration (in milliseconds) and a target state. After the specified duration, it transitions to the target state.
