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

  toHTML(): string {
    const mermaidDiagram = this.toMermaid();
    return /*html*/ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <style type="text/css">
      #mySvgId {
        height: 90%;
        width: 90%;
      }
    </style>
  </head>
  <body>
    <div id="graphDiv"></div>
    <script src="https://bumbu.me/svg-pan-zoom/dist/svg-pan-zoom.js"></script>
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: false });
      // Example of using the render function
      const drawDiagram = async function () {
        const element = document.querySelector('#graphDiv');
        const graphDefinition = \`${mermaidDiagram}\`;
        const { svg } = await mermaid.render('mySvgId', graphDefinition);
        element.innerHTML = svg.replace(/[ ]*max-width:[ 0-9\.]*px;/i , '');
        var panZoomTiger = svgPanZoom('#mySvgId', {
          zoomEnabled: true,
          controlIconsEnabled: true,
          fit: true,
          center: true
        })
      };
      await drawDiagram();
    </script>
  </body>
</html>
    `.trim();
  }
}
