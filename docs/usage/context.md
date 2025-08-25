---
title: Context
description: Understanding the context in Nanomachine.
outline: deep
---

# Context

Define the machine’s data model and make it available to all handlers.

```ts
.context<{
  count: number;
  user?: { id: string };
}>()
```

## Rules

- It accepts a <u>type parameter</u> defining the context structure.
- It accepts _no_ arguments.
