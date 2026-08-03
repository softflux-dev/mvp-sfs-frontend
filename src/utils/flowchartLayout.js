// utils/flowchartLayout.js
// Client-side auto-layout for the flowchart editor's "Auto-arrange" button.
// Requires:  npm i dagre
import dagre from "dagre";

const NODE_W = 190;
const NODE_H = 60;
const DECISION_SIZE = 140;

export function layoutFlow(nodes, edges, direction = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 90 });

  nodes.forEach((n) => {
    const isDecision = n.data?.shape === "decision";
    g.setNode(n.id, {
      width:  isDecision ? DECISION_SIZE : NODE_W,
      height: isDecision ? DECISION_SIZE : NODE_H,
    });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id) || { x: 0, y: 0 };
    const isDecision = n.data?.shape === "decision";
    const w = isDecision ? DECISION_SIZE : NODE_W;
    const h = isDecision ? DECISION_SIZE : NODE_H;
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}