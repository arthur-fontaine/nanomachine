---
title: Getting Started
description: Get started with Nanomachine, including installation.
outline: deep
---

# Getting Started

## Installation

::: code-group

```bash [pnpm]
pnpm add nanomachine
```

```bash [yarn]
yarn add nanomachine
```

```bash [npm]
npm install nanomachine
```

```bash [bun]
bun add nanomachine
```

```ts [deno]
import { createStateMachine } from "npm:nanomachine";
```

:::

## Overview

Here’s a relatively complete example of a counter state machine:

```ts [counter.ts]
import { createStateMachine } from "nanomachine";

const machine = createStateMachine()
  .context<{ count: number }>()
  .events<{ increment: [number]; reset: [] }>()
  .states<"idle" | "counting">()
  .initial("idle")
  .implement({
    idle: (state) =>
      state.onReceive({
        increment: (ctx, set, value) => {
          set({ count: ctx.count + value });
          return "counting";
        },
      }),
    counting: (state) =>
      state.onReceive({
        reset: (ctx, set) => {
          set({ count: 0 });
          return "idle";
        },
      }),
  })
  .start({ count: 0 });

machine.emit("increment", 5);
console.log(machine.get()); // { count: 5 }
```

This example demonstrates:

- **Context**: A count property stored in the machine.
- **Events**: increment with a numeric payload and reset without a payload.
- **States**: idle and counting.
- **Initial state**: The machine starts in idle.
- **Implementation**: Handlers update context and transition states.
- **Runtime usage**: Start the machine, emit events, and read updated context.
