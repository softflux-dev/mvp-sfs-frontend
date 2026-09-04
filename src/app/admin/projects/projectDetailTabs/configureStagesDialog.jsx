// projectDetailTabs/configureStagesDialog.jsx
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import {
  DialogContainer, DialogHeader, DialogBody, TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";

const MIN_STAGES = 3;
const MAX_STAGES = 15;

const ConfigureStagesDialog = ({ open, onClose, onSave, currentCount = 5, loading = false }) => {
  const [count, setCount] = useState(currentCount);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCount(currentCount);
      setError("");
    }
  }, [open, currentCount]);

    const clamp = (n) => (isNaN(n) ? MIN_STAGES : Math.min(MAX_STAGES, Math.max(MIN_STAGES, Math.floor(n))));

    useEffect(() => {
    if (count === "") { setError(""); return; }
    if (Number(count) < MIN_STAGES) { setError(`Minimum ${MIN_STAGES} stages required.`); return; }
    if (Number(count) > MAX_STAGES) { setError(`Maximum ${MAX_STAGES} stages allowed.`); return; }
    setError("");
  }, [count]);

  const handleChange = (e) => {
    const raw = e?.target ? e.target.value : e;
    if (raw === "") { setCount(""); return; }
    // Strip anything that isn't a digit — blocks "-", "+", "e", "." from
    // ever reaching state at all, regardless of how they got typed/pasted.
    const digitsOnly = String(raw).replace(/[^\d]/g, "");
    setCount(digitsOnly === "" ? "" : parseInt(digitsOnly, 10));
  };

  // ── Block the specific keys that let a number input go negative or
  // non-integer: minus, plus, "e" (scientific notation), and decimal point.
  // Also explicitly block ArrowDown once already at the floor, since native
  // spinner/keyboard clamping via `min` isn't 100% consistent across browsers. ──
  const handleKeyDown = (e) => {
    if (["-", "+", "e", "E", "."].includes(e.key)) {
      e.preventDefault();
      return;
    }
        if (e.key === "ArrowDown") {
      const current = count === "" ? MIN_STAGES : Number(count);
      if (current <= MIN_STAGES) {
        e.preventDefault();
        setCount(MIN_STAGES);
        setError(`Minimum ${MIN_STAGES} stages required.`);
      }
    }
    if (e.key === "ArrowUp") {
      const current = count === "" ? MIN_STAGES : Number(count);
      if (current >= MAX_STAGES) {
        e.preventDefault();
        setCount(MAX_STAGES);
        setError(`Maximum ${MAX_STAGES} stages allowed.`);
      }
    }
  };
  

  // Belt-and-suspenders: also sanitize on paste, since pasting bypasses keydown.
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (/[^\d]/.test(pasted)) e.preventDefault();
  };

  const handleBlur = () => setCount((prev) => clamp(Number(prev)));

    const isInvalid = count === "" || Number(count) < MIN_STAGES || Number(count) > MAX_STAGES;

  const handleSave = () => {
    if (isInvalid) {
      setError(`Minimum ${MIN_STAGES} stages required.`);
      return;
    }
    onSave(clamp(Number(count)));
  };

  const handleClose = () => {
    setCount(currentCount);
    setError("");
    onClose?.();
  };

  return (
    <DialogContainer open={open} onClose={handleClose} maxWidth="420px" fullWidth>
      <DialogHeader title="Configure Pipeline Stages" onClose={handleClose} />

      <DialogBody>
        <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

          <Typography fontSize="13px" color="text.secondary">
            Choose how many stages this project's task pipeline should have.
            The last stage is always treated as <strong>Completed</strong>.
            Minimum {MIN_STAGES}, maximum {MAX_STAGES} stages.
          </Typography>

          <Box>
            <CustomInputLabel label="Number of Stages *" />
            <TextInput
              type="number"
              placeholder="Enter number of stages"
              value={count}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={handleBlur}
              inputBgColor="#fff"
              fullWidth
              error={!!error}
              helperText={error}
              inputProps={{ min: MIN_STAGES, max: MAX_STAGES, step: 1 }}
            />
          </Box>

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText={loading ? "Saving..." : "Save"}
        isConfirmBtnDisable={loading || isInvalid}
        variant="gradient"
      />
    </DialogContainer>
  );
};

export default ConfigureStagesDialog;