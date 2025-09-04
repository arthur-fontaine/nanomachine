---
title: Graph  
description: Discover how to visualize your state machines in a graphical format.
outline: deep
---

# Graph

Nanomachine comes with built-in support for generating a graph representation of your state machines. This feature is built as a utility function that you can use as you wish. It uses [Mermaid](https://mermaid-js.github.io/mermaid/#/) syntax to describe the graph, which you can then render using any Mermaid-compatible tool.

## Generate the Graph

```ts
import { createGraph } from "nanomachine/graph";
import { machine } from "./machine.ts";

const graph = createGraph(machine);
console.log(graph.toMermaid());
```

## Serve the Graph as a Webpage

Nanomachine offers a convenient way to convert graphs into HTML format for web server deployment. It includes the necessary Mermaid scripts to render the graph directly in the browser, along with [`svg-pan-zoom`](https://github.com/bumbu/svg-pan-zoom) for graph manipulation.

You can use the included Node.js `http` module to quickly set up a server:

```ts
import http from "node:http";
import { createGraph } from "nanomachine/graph";
import { machine } from "./machine.ts";

const html = createGraph(machine).toHTML();

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```
