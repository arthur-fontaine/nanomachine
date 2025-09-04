---
title: File Split
description: Learn how to split your Nanomachine state machine into multiple files for better organization.
outline: deep
---

# File Split

Nanomachine enables you to define your state machine modularly, facilitating management and scalability. This approach is especially beneficial as your state machine increases in complexity or size. By dividing your state machine into multiple files, you can keep your codebase organized and maintainable.

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

## `machineConfig.ts`

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

## `machine.ts`

```ts
import { machineConfig } from "./machineConfig";
import { idleState } from "./states/idle";
import { countingState } from "./states/counting";

export const machine = machineConfig.implement({
  IDLE: idleState,
  COUNTING: countingState,
});
```

## `states/idle.ts`

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

## `states/counting.ts`

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

## `main.ts`

```ts
import { machine } from "./machine";

machine.start({ count: 0 });

machine.emit("INCREMENT", 5);
console.log(machine.get()); // { count: 5 }

machine.emit("RESET");
console.log(machine.get()); // { count: 0 }
```
