// projectDetailTabs/planFlowchartEditor.jsx
// Interactive flowchart. Drag boxes, double-click a box to edit its text,
// drag from a handle to connect, select + Backspace to delete.
// Toolbar: Auto-arrange (dagre re-layout), Fit view, Download PNG.
// Controlled: parent owns `value` = { nodes, edges } and receives updates
// via onChange.
// Requires:  npm i reactflow dagre html-to-image
import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background, Controls, Handle, Position,
  applyNodeChanges, applyEdgeChanges, addEdge,
  getRectOfNodes, getTransformForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import { Box, Typography } from "@mui/material";
import { layoutFlow } from "../../../../utils/flowchartLayout";

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

  // Explicit dark text color — without this it can inherit white/invisible
  // text from a global input style elsewhere in the app.
  const input = (
    <input
      autoFocus value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
      style={{ width: "100%", border: "none", outline: "none", background: "transparent",
               textAlign: "center", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
               color: "#111827" }}
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

const ToolbarBtn = ({ onClick, children, title }) => (
  <Box onClick={onClick} title={title}
    sx={{ px: 1.25, py: 0.5, borderRadius: "8px", border: "1px solid #E5E7EB", cursor: "pointer",
          fontSize: 12, fontWeight: 500, color: "#374151", whiteSpace: "nowrap",
          "&:hover": { backgroundColor: "#F9FAFB" } }}>
    {children}
  </Box>
);

const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement("a");
  a.setAttribute("download", filename);
  a.setAttribute("href", dataUrl);
  a.click();
};

const PlanFlowchartEditor = ({ value = { nodes: [], edges: [] }, onChange, editable = true, height = 380 }) => {
  const nodes = value?.nodes || [];
  const edges = value?.edges || [];
  const [rfInstance, setRfInstance] = useState(null);
  const wrapperRef = useRef(null);

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

  // ── Auto-arrange: recompute a clean dagre layout from current graph shape ──
  const handleAutoArrange = () => {
    const laid = layoutFlow(nodes, edges);
    onChange?.({ nodes: laid, edges });
    requestAnimationFrame(() => rfInstance?.fitView({ padding: 0.2 }));
  };

  const handleFitView = () => rfInstance?.fitView({ padding: 0.2 });

  // ── Download the COMPLETE diagram as a PNG, not just the visible viewport ──
  const handleDownload = () => {
    if (!rfInstance) return;
    const allNodes = rfInstance.getNodes();
    if (!allNodes.length) return;

    const bounds = getRectOfNodes(allNodes);
    const imageWidth  = Math.max(800, Math.round(bounds.width + 160));
    const imageHeight = Math.max(600, Math.round(bounds.height + 160));
    const transform = getTransformForBounds(bounds, imageWidth, imageHeight, 0.5, 2);

    const viewport = wrapperRef.current?.querySelector(".react-flow__viewport");
    if (!viewport) return;

    toPng(viewport, {
      backgroundColor: "#ffffff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((dataUrl) => downloadDataUrl(dataUrl, "flowchart.png"));
  };

  // inject render-time props into node data (label editing + editable flag)
  const rfNodes = nodes.map((n) => ({ ...n, data: { ...n.data, onLabelChange, editable } }));

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
        {editable && (
          <>
            <ToolbarBtn onClick={() => addNode("process")}>+ Step</ToolbarBtn>
            <ToolbarBtn onClick={() => addNode("decision")}>+ Decision</ToolbarBtn>
            <ToolbarBtn onClick={() => addNode("start")}>+ Start</ToolbarBtn>
            <ToolbarBtn onClick={() => addNode("end")}>+ End</ToolbarBtn>
            <ToolbarBtn onClick={handleAutoArrange} title="Re-arrange boxes automatically">
              Auto-arrange
            </ToolbarBtn>
          </>
        )}
        <ToolbarBtn onClick={handleFitView} title="Fit the whole diagram in view">
          Fit view
        </ToolbarBtn>
        <ToolbarBtn onClick={handleDownload} title="Download the full diagram as a PNG image">
          ⬇ Download PNG
        </ToolbarBtn>
        {editable && (
          <Typography fontSize={11} color="text.secondary" sx={{ ml: 0.5 }}>
            Drag boxes · double-click to rename · drag between dots to connect · Backspace to delete
          </Typography>
        )}
      </Box>

      <Box ref={wrapperRef}
        sx={{ height, border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={setRfInstance}
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
          <Controls showInteractive={false} />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default PlanFlowchartEditor;