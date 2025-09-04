---
title: Run a State Machine  
description: Learn how to execute your state machines using Nanomachine.
outline: deep
---

# Run a State Machine

With Nanomachine, every state machine you create is an independent instance. This means you can start, stop, and manage multiple instances of the same state machine without any interference.

```ts
import { machine } from "./machine";

const machineInstance = machine.start({});
```

The `start` method requires your initial context as an argument.

## Wait for Completion

Some state machines are designed to run indefinitely, while others have a defined end state. If your state machine has a terminal state, you can use the special `$_END` event in your transitions to indicate completion.

```ts
// State implementation example with an end state
state.onReceive({
  finish: () => '$_END',
})
```

You can then `await` your state machine instance to wait for it to reach the end state.

```ts
const machineInstance = machine.start({});
await machineInstance.$promise;
```

## Get Current State

You can access the current state of your state machine instance at any time by using the `get` method.

```ts
const machineInstance = machine.start({});
console.log(machineInstance.get()); // Outputs the current state
```

## Subscribe to State Changes

You can subscribe to state changes using the `subscribe` method. This enables you to run a callback function whenever the state changes.

```ts
const machineInstance = machine.start({});
const unsubscribe = machineInstance.subscribe((state) => {
  console.log("State changed to:", state);
});
// To stop listening to state changes, call the unsubscribe function
unsubscribe();
```

## Emit Events

You can send events to your state machine instance using the `emit` method. This triggers transitions between states.

```ts
const machineInstance = machine.start({});
machineInstance.emit("eventName", eventData);
```

## Set Context

In certain situations, you may want to directly set the context of your state machine instance. You can accomplish this using the `set` method.

```ts
const machineInstance = machine.start({});
machineInstance.set({ key: "value" });
```
