---
title: Events
description: Understanding events in Nanomachine.
outline: deep
---

# Events

Declare which messages the machine accepts and the payload each carries.

```ts
.events<{
  increment: [number];
  reset: [];
}>()
```

## Rules

- It accepts a <u>type parameter</u> defining the events and their payloads.
- Each event name maps to either an empty tuple (`[]`) or a single-element tuple specifying its payload type (`[number]`).
- It accepts _no_ arguments.
