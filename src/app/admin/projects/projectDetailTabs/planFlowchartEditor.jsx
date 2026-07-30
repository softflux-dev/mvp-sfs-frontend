// projectDetailTabs/planFlowchartEditor.jsx
// Interactive flowchart. Drag boxes, double-click a box to edit its text,
// drag from a handle to connect, select + Backspace to delete. Controlled:
// parent owns `value` = { nodes, edges } and receives updates via onChange.
// Requires:  npm i reactflow
import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background, Controls, Handle, Position,
  applyNodeChanges, applyEdgeChanges, addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Typography } from "@mui/material";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const SHAPE_STYLE = {
  start:    { bg: "#D1FAE5", bd: "#10B981", radius: 20 },
  end:      { bg: "#FCE7F3", bd: "#DB2777", radius: 20 },
  process:  { bg: "#EDE9FE", bd: "#8B5CF6", radius: 8 },
  decision: { bg: "#FEF3C7", bd: "#F59E0B", radius: 6 },
};

// ── Custom node: shaped box with double-click inline editing ─────────────────
function FlowNode({ id, data }) {
  const { label, shape = "process", editable, onLabelChange } = data;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(label);
  useEffect(() => { if (!editing) setText(label); }, [label, editing]);

  const commit = () => { setEditing(false); if (text !== label) onLabelChange?.(id, text); };
  const cfg = SHAPE_STYLE[shape] || SHAPE_STYLE.process;
  const isDecision = shape === "decision";

  const input = (
    <input
      autoFocus value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
      style={{ width: "100%", border: "none", outline: "none", background: "transparent",
               textAlign: "center", fontSize: 12, fontWeight: 500, fontFamily: "inherit" }}
    />
  );

  if (isDecision) {
    return (
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <Handle type="target" position={Position.Top} />
        <div style={{ position: "absolute", inset: 18, transform: "rotate(45deg)",
                      background: cfg.bg, border: `1.5px solid ${cfg.bd}`, borderRadius: cfg.radius }} />
        <div onDoubleClick={() => editable && setEditing(true)}
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                   justifyContent: "center", padding: 22, fontSize: 12, fontWeight: 500,
                   textAlign: "center", color: "#374151" }}>
          {editing ? input : (label || "…")}
        </div>
        <Handle type="source" position={Position.Bottom} id="b" />
        <Handle type="source" position={Position.Right} id="r" />
      </div>
    );
  }

  return (
    <div onDoubleClick={() => editable && setEditing(true)}
      style={{ minWidth: 120, maxWidth: 210, padding: "10px 14px",
               background: cfg.bg, border: `1.5px solid ${cfg.bd}`, borderRadius: cfg.radius,
               fontSize: 12, fontWeight: 500, textAlign: "center", color: "#374151" }}>
      <Handle type="target" position={Position.Top} />
      {editing ? input : (label || "…")}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

const AddBtn = ({ onClick, children }) => (
  <Box onClick={onClick}
    sx={{ px: 1.25, py: 0.5, borderRadius: "8px", border: "1px solid #E5E7EB", cursor: "pointer",
          fontSize: 12, fontWeight: 500, color: "#374151", "&:hover": { backgroundColor: "#F9FAFB" } }}>
    {children}
  </Box>
);

const PlanFlowchartEditor = ({ value = { nodes: [], edges: [] }, onChange, editable = true, height = 380 }) => {
  const nodes = value?.nodes || [];
  const edges = value?.edges || [];

  const onNodesChange = useCallback(
    (changes) => onChange?.({ nodes: applyNodeChanges(changes, nodes), edges }),
    [nodes, edges, onChange]);

  const onEdgesChange = useCallback(
    (changes) => onChange?.({ nodes, edges: applyEdgeChanges(changes, edges) }),
    [nodes, edges, onChange]);

  const onConnect = useCallback(
    (conn) => onChange?.({ nodes, edges: addEdge({ ...conn, id: uid(), markerEnd: { type: "arrowclosed" } }, edges) }),
    [nodes, edges, onChange]);

  const onLabelChange = useCallback(
    (nid, label) => onChange?.({ nodes: nodes.map((n) => (n.id === nid ? { ...n, data: { ...n.data, label } } : n)), edges }),
    [nodes, edges, onChange]);

  const addNode = (shape) => {
    const n = {
      id: uid(), type: "flow",
      position: { x: 260 + Math.random() * 60, y: 40 + nodes.length * 30 },
      data: { label: shape === "decision" ? "Decision?" : shape === "start" ? "Start" : shape === "end" ? "End" : "Step", shape },
    };
    onChange?.({ nodes: [...nodes, n], edges });
  };

  // inject render-time props into node data (label editing + editable flag)
  const rfNodes = nodes.map((n) => ({ ...n, data: { ...n.data, onLabelChange, editable } }));

  return (
    <Box>
      {editable && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
          <AddBtn onClick={() => addNode("process")}>+ Step</AddBtn>
          <AddBtn onClick={() => addNode("decision")}>+ Decision</AddBtn>
          <AddBtn onClick={() => addNode("start")}>+ Start</AddBtn>
          <AddBtn onClick={() => addNode("end")}>+ End</AddBtn>
          <Typography fontSize={11} color="text.secondary" sx={{ ml: 0.5 }}>
            Drag boxes · double-click to rename · drag between dots to connect · Backspace to delete
          </Typography>
        </Box>
      )}

      <Box sx={{ height, border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={editable ? onNodesChange : undefined}
          onEdgesChange={editable ? onEdgesChange : undefined}
          onConnect={editable ? onConnect : undefined}
          nodesDraggable={editable}
          nodesConnectable={editable}
          elementsSelectable={editable}
          deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background gap={16} color="#EEE" />
          {editable && <Controls showInteractive={false} />}
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default PlanFlowchartEditor;