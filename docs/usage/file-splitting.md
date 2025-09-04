---
title: File Splitting
description: Learn how to split your Nanomachine state machine into multiple files for better organization.
outline: deep
---

# File Splitting

Nanomachine enables you to define your state machine modularly, facilitating management and scalability. This approach is especially beneficial as your state machine increases in complexity or size. By dividing your state machine into multiple files, you can keep your codebase organized and maintainable.

## Machine Configuration

The first step in splitting your state machine is to create a central configuration file. This file will define the context, events, states, and the initial state of your machine.

```ts
import { createStateMachine } from "nanomachine";

interface MachineContext {
  count: number;
}

export const machineConfig = createStateMachine()
  .context<MachineContext>()
  .events<{
    INCREMENT: [number];
    RESET: [];
  }>()
  .states<
    | "IDLE"
    | "COUNTING"
  >()
  .initial("IDLE");
```

## Type Safety of State Implementations

When splitting your state machine into multiple files, it's crucial to maintain type safety. Nanomachine provides a utility type `$` on the machine configuration object to help you achieve this. This utility type allows you to reference the types of states, ensuring that your implementations remain consistent with the defined configuration.

For example, when implementing the `IDLE` state in a separate file, you can use the `$` type to ensure that your implementation matches the expected type:

```ts
import { machineConfig } from "../machineConfig";

export const idleState: typeof machineConfig.$.IDLE =
  (state) =>
    state.onReceive({
      INCREMENT: (ctx, set, value) => {
        set({ count: ctx.count + value });
        return "COUNTING";
      },
    });
```

> The `typeof machineConfig.$.IDLE` automatically infers the type of the `state` parameter.

## Putting It All Together

Once you have your machine configuration set up and your states implemented in separate files, you can bring everything together in a main machine file. This file will import the configuration and state implementations, and then use the `implement` method to create the complete state machine.

```ts
import { machineConfig } from "./machineConfig";
import { idleState } from "./states/idle";
import { countingState } from "./states/counting";

export const machine = machineConfig.implement({
  IDLE: idleState,
  COUNTING: countingState,
});
```

## Example Structure

Here's an example of how you might structure your files:

```
src/
├── states/
│   ├── idle.ts
│   └── counting.ts
├── machine.ts
├── machineConfig.ts
└── main.ts
```

> [!NOTE]
> You might also want to wrap your state machine files in a `src/machine/` directory to keep things organized. (In this example, it would result in `src/machine/states/`, `src/machine/machine.ts` and `src/machine/machineConfig.ts`).

### `machineConfig.ts`

```ts
import { createStateMachine } from "nanomachine";

interface MachineContext {
  count: number;
}

export const machineConfig = createStateMachine()
  .context<MachineContext>()
  .events<{
    INCREMENT: [number];
    RESET: [];
  }>()
  .states<
    | "IDLE"
    | "COUNTING"
  >()
  .initial("IDLE");
```

### `machine.ts`

```ts
import { machineConfig } from "./machineConfig";
import { idleState } from "./states/idle";
import { countingState } from "./states/counting";

export const machine = machineConfig.implement({
  IDLE: idleState,
  COUNTING: countingState,
});
```

### `states/idle.ts`

```ts
import { machineConfig } from "../machineConfig";

export const idleState: typeof machineConfig.$.IDLE =
  (state) =>
    state.onReceive({
      INCREMENT: (ctx, set, value) => {
        set({ count: ctx.count + value });
        return "COUNTING";
      },
    });
```

### `states/counting.ts`

```ts
import { machineConfig } from "../machineConfig";

export const countingState: typeof machineConfig.$.COUNTING =
  (state) =>
    state.onReceive({
      RESET: (ctx, set) => {
        set({ count: 0 });
        return "IDLE";
      },
    });
```

### `main.ts`

```ts
import { machine } from "./machine";

machine.start({ count: 0 });

machine.emit("INCREMENT", 5);
console.log(machine.get()); // { count: 5 }

machine.emit("RESET");
console.log(machine.get()); // { count: 0 }
```
