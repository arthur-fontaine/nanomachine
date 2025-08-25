---
title: Initial
description: Understanding the initial in Nanomachine.
outline: deep
---

# Initial

Choose the state active after `start(...)`.

```ts
.initial("idle")
```

## Rules

- It accepts a single <u>argument</u> specifying the initial state.
- The argument must be one of the states defined in `.states<...>()`.
- It must be called after `.states<...>()` and before `.implement(...)`.
