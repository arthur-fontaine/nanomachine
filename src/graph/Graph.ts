export class Graph {
  private nodes: Set<string> = new Set();
  private edges: Map<string, Set<string>> = new Map();

  addNode(node: string) {
    this.nodes.add(node);
  }

  addEdge(from: string, to: string) {
    if (!this.edges.has(from)) {
      this.edges.set(from, new Set());
    }
    this.edges.get(from)!.add(to);
  }

  toMermaid(): string {
    let mermaid = 'graph TD\n';
    for (const node of this.nodes) {
      mermaid += `  ${node}\n`;
    }
    for (const [from, tos] of this.edges.entries()) {
      for (const to of tos) {
        mermaid += `  ${from} --> ${to}\n`;
      }
    }
    return mermaid;
  }
}
