---
title: States
description: Understanding states in Nanomachine.
outline: deep
---

# States

List the finite set of names your machine can be in.

```ts
.states<"idle" | "counting" | "error">()
```

## Rules

- It accepts a <u>type parameter</u> defining the state names.
- Use a _union of string literals_ to specify the possible states.
- It accepts _no_ arguments.
