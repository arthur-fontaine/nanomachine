---
title: Create a State Machine  
description: A step-by-step guide to creating your first state machine with Nanomachine.  
outline: deep  
---

# Create a State Machine

Here is a step-by-step guide to creating your first state machine with Nanomachine.

## Starting Point

Building a state machine with Nanomachine is straightforward. Start by using the `createStateMachine` function and follow your editor's auto-completion to fill in the details.

```ts
import { createStateMachine } from "nanomachine";

const machine = createStateMachine()
```

## Define Context

The context is the data that your state machine will manage. Define it using the `context` method.

```ts
const machine = createStateMachine()
  .context<{ count: number }>()
```

> [!TIP]  
> After writing `createStateMachine().`, your editor provides a single option to auto-complete: `context`. Nanomachine is designed to guide you through building your state machine step by step.

## Define Events

Next, define the events that your state machine will respond to using the `events` method.

```ts
const machine = createStateMachine()
  .context<...>()
  .events<{
    INCREMENT: [number];
    DECREMENT_BY_ONE: [];
  }>()
```

The `events` method takes a single type argument, which is an object where the keys are the event names and the values are tuples representing the event payloads.

## Define States

Now, define the states of your state machine using the `states` method.

```ts
const machine = createStateMachine()
  .context<...>()
  .events<...>()
  .states<
    | "IDLE"
    | "ACTIVE"
  >()
```

Because Nanomachine is designed to be modular, the `states` method also takes a single type argument, which is a union of string literals representing the state names. The actual state definitions will be provided later.

## Define Initial State

Next, set the initial state of your state machine using the `initial` method.

```ts
const machine = createStateMachine()
  .context<...>()
  .events<...>()
  .states<...>()
  .initial("IDLE")
```

> [!TIP]  
> After writing `.initial(`, your editor suggests the state names you defined earlier.

## Define State Behaviors / Implementation

Finally, provide the implementation for each state using the `implement` method.

```ts
const machine = createStateMachine()
  .context<...>()
  .events<...>()
  .states<...>()
  .initial(...)
  .implement({
    IDLE: (state) => state, // your implementation here
  })
```

To implement a state, take a look at the next page: [Implement States](./implement-states.md).
