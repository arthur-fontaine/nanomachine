---
title: Implement
description: Understanding how to implement a Nanomachine.
outline: deep
---

# Implement

Attach behavior to each state using the state builder methods.

```ts
.implement({
  idle: (s) =>
    s
      .guard((ctx) => ctx.count >= 0, "error")
      .onEntry((ctx, set, emit) => {
        if (ctx.count === 0) emit("increment", 1);
      })
      .onReceive({
        increment: (ctx, set, by) => {
          set({ count: ctx.count + by });
          return "counting";
        },
      })
      .after(2_000, "counting"),

  counting: (s) =>
    s
      .guardContext("count", (c) => c !== undefined, "error")
      .onReceive({
        reset: (ctx, set) => {
          set({ count: 0 });
          return "idle";
        },
      }),

  error: (s) =>
    s.onEntry((ctx) => {
      console.error("Invalid context:", ctx);
    }),
})
```

## Rules

- It accepts a single <u>argument</u> which is an object mapping state names to their implementations.

## State Builder Methods

### `guard`

```ts
.guard((ctx) => true, "error")
```

- It accepts a <u>function</u> that returns a boolean and a <u>fallback state</u>.
- The function can access the current context.
- If the predicate returns `false`, it transitions to the specified state without executing further handlers.

### `guardContext`

```ts
.guardContext("count", (c) => c !== undefined, "error")
```

- It accepts a <u>context key</u>, a <u>predicate function</u> (a function returning `xxx is yyy`) and a <u>fallback state</u>.
- It checks if the specified context key satisfies the predicate.
- If the predicate returns `false`, it transitions to the specified state without executing further handlers.
- It modifies the context type of the following handlers:
  
  ```ts
  // Admits the context type is `{ count: number | undefined }`
  .guardContext("count", (c) => c !== undefined, "error") // Following handlers' context type is `{ count: number }`
  .onEntry((ctx) => {}) // ctx.count is number, not number | undefined
  ```

### `localEvent`

```ts
.localEvent<'decrement', [number]>()
```

- It accepts two <u>type parameters</u>:
  - The event name as a string literal.
  - The event payload as a tuple type (e.g., `[number]`). See [Events](./events.md) for more details.
- Local events are only available in the current state.

### `onEntry`

```ts
.onEntry((ctx, set, emit) => {
  console.log("Entering state with context:", ctx);
  set({ count: ctx.count + 1 }); // Update context
  emit("increment", 1); // Emit an event
})
```

- It accepts a <u>function</u> that runs when entering the state.
- The function receives:
  - `ctx`: The current context.
  - `set`: A function to update the context.
  - `emit`: A function to emit events.

### `onReceive`

```ts
.onReceive({
  increment: (ctx, set, by) => {
    set({ count: ctx.count + by });
    return "counting"; // Transition to counting state
  },
})
```

- It accepts an object mapping event names to their handlers.
- Not all events need to be handled.
- Each handler receives:
  - `ctx`: The current context.
  - `set`: A function to update the context.
  - The event payload (if any).

### `after`

```ts
.after(2_000, "counting")
```

- It accepts a duration (in milliseconds) and a target state.
- After the specified duration, it transitions to the target state.
