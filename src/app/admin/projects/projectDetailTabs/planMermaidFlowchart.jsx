// projectDetailTabs/planMermaidFlowchart.jsx
// Renders a proper UML-style flowchart from Mermaid text. When editable, a
// "Edit diagram text" toggle reveals the source; editing re-renders live.
// Requires the `mermaid` package:  npm i mermaid
import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import mermaid from "mermaid";

let initialized = false;
const ensureInit = () => {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad:   false,
    securityLevel: "loose",
    theme:         "default",
    flowchart:     { htmlLabels: true, curve: "basis" },
  });
  initialized = true;
};

const stripFences = (t = "") =>
  String(t).replace(/```mermaid/gi, "").replace(/```/g, "").trim();

const PlanMermaidFlowchart = ({ code = "", onChange, editable = true }) => {
  const [showSource, setShowSource] = useState(false);
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");
  const idRef   = useRef(`mmd-${Math.random().toString(36).slice(2)}`);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    ensureInit();
    const src = stripFences(code);
    if (!src) { setSvg(""); setErr(""); return; }

    let cancelled = false;
    (async () => {
      try {
        const renderId = `${idRef.current}-${Date.now().toString(36)}`;
        const { svg: out } = await mermaid.render(renderId, src);
        if (!cancelled && mounted.current) { setSvg(out); setErr(""); }
      } catch (e) {
        // Keep the last good diagram; just flag the syntax error.
        if (!cancelled && mounted.current) {
          setErr(e?.message ? String(e.message).split("\n")[0] : "Invalid flowchart syntax.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <Box>
      <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", p: 2,
                 overflowX: "auto", textAlign: "center", minHeight: 80 }}>
        {svg ? (
          <Box sx={{ "& svg": { maxWidth: "100%", height: "auto" } }}
               dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <Typography fontSize={13} color="text.secondary">No flowchart.</Typography>
        )}
      </Box>

      {err && (
        <Typography fontSize={12} color="error" mt={0.75}>
          Diagram error: {err}
        </Typography>
      )}

      {editable && (
        <Box mt={1}>
          <Box onClick={() => setShowSource((s) => !s)}
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer",
                  color: "#AA2493", fontSize: 13, fontWeight: 600 }}>
            {showSource ? "Hide diagram text" : "Edit diagram text"}
          </Box>
          {showSource && (
            <textarea
              value={code}
              onChange={(e) => onChange?.(e.target.value)}
              spellCheck={false}
              placeholder={"flowchart TD\n  A([Start]) --> B[Do something]\n  B --> C{Decision?}\n  C -->|Yes| D([End])"}
              style={{
                width: "100%", minHeight: 170, marginTop: 8, padding: 12,
                fontFamily: "monospace", fontSize: 12, lineHeight: 1.6,
                border: "1px solid #E5E7EB", borderRadius: 10, outline: "none",
                resize: "vertical", background: "#fff", color: "#111827",
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default PlanMermaidFlowchart;