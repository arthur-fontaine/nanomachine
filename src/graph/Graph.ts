export class Graph {
  private nodes: Set<string> = new Set();
  
  private continueEdges: Map<string, Set<string>> = new Map();
  private guardEdges: Map<string, Set<string>> = new Map();

  addNode(node: string) {
    this.nodes.add(node);
  }

  addEdge(from: string, to: string, type: 'continue' | 'guard') {
    const edgesMap = type === 'continue' ? this.continueEdges : this.guardEdges;
    if (!edgesMap.has(from)) {
      edgesMap.set(from, new Set());
    }
    edgesMap.get(from)!.add(to);
  }

  toMermaid(): string {
    let mermaid = 'graph TD\n';
    for (const node of this.nodes) {
      mermaid += `  ${node}\n`;
    }
    for (const [from, tos] of this.continueEdges.entries()) {
      for (const to of tos) {
        mermaid += `  ${from} --> ${to}\n`;
      }
    }
    for (const [from, tos] of this.guardEdges.entries()) {
      for (const to of tos) {
        mermaid += `  ${from} o.-> ${to}\n`;
      }
    }
    return mermaid;
  }
}
