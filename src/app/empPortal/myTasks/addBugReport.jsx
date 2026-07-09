// addBugReport.jsx


import { useState, useEffect, useRef } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { ImagePlus, X }              from "lucide-react";

import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  CustomSelect,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

const SEVERITY_OPTIONS = [
  { value: "low",      label: "Low"      },
  { value: "medium",   label: "Medium"   },
  { value: "high",     label: "High"     },
  { value: "critical", label: "Critical" },
];

const STATUS_OPTIONS = [
  { value: "open",        label: "Open"        },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved"    },
  { value: "closed",      label: "Closed"      },
];

const INITIAL_FORM = {
  tcId:             "",
  title:            "",
  severity:         "low",
  status:           "open",
  description:      "",
  stepsToReproduce: "",
  expectedBehavior: "",
  actualBehavior:   "",
  environment:      "",
  screenshots:      [],
};

const AddBugReport = ({ open, onClose, onSave, editingBug = null, loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const fieldRefs = {
    title:    useRef(null),
    severity: useRef(null),
    status:   useRef(null),
  };

  const isEdit = Boolean(editingBug);

  useEffect(() => {
    if (!open) return;
    if (editingBug) {
      setFormData({
        tcId:             editingBug.tcId             || editingBug._id || editingBug.id || "",
        title:            editingBug.title            || "",
        severity:         editingBug.severity?.toLowerCase()  || "low",
        status:           editingBug.status?.toLowerCase()    || "open",
        description:      editingBug.description      || "",
        stepsToReproduce: editingBug.stepsToReproduce || "",
        expectedBehavior: editingBug.expectedBehavior || "",
        actualBehavior:   editingBug.actualBehavior   || "",
        environment:      editingBug.environment      || "",
        screenshots: (editingBug.screenshots || []).map((s) =>
          typeof s === "string" ? { url: s } : s
        ),
      });
    } else {
      // tcId will be assigned by server; show placeholder
      setFormData({ ...INITIAL_FORM, tcId: "Auto-generated" });
    }
    setErrors({});
  }, [editingBug, open]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddScreenshots = (e) => {
    const newItems = Array.from(e.target.files || []).map((file) => ({
      url:  URL.createObjectURL(file),
      file,
    }));
    setFormData((prev) => ({ ...prev, screenshots: [...prev.screenshots, ...newItems] }));
    e.target.value = "";
  };

  const handleRemove = (idx) => {
    setFormData((prev) => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== idx) }));
  };

  const handleReplace = (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated  = [...formData.screenshots];
    updated[idx]   = { url: URL.createObjectURL(file), file };
    setFormData((prev) => ({ ...prev, screenshots: updated }));
    e.target.value = "";
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title    = "Bug title is required";
    if (!formData.severity)     e.severity = "Severity is required";
    if (!formData.status)       e.status   = "Status is required";
    return e;
  };

  const FIELD_ORDER = ["title", "severity", "status"];

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);

      const firstErrorField = FIELD_ORDER.find((f) => errs[f]);
      if (firstErrorField && fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block:    "center",
        });
      }
      return;
    }
    onSave?.(formData);
    handleClose();
    setSuccessOpen(true);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="520px" fullWidth>
        <DialogHeader
          title={isEdit ? "Edit Bug Report" : "Add Bug Report"}
          onClose={handleClose}
        />

        <DialogBody>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* TC ID — readonly */}
            <Box>
              <CustomInputLabel label="TC ID" />
              <TextInput
                value={formData.tcId}
                inputBgColor="#fff"
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ "& input": { color: "#67768B", cursor: "default" } }}
              />
            </Box>

            {/* Bug Title */}
            <Box ref={fieldRefs.title}>
              <CustomInputLabel label="Bug Title *" />
              <TextInput
                placeholder="Enter bug title"
                value={formData.title}
                onChange={handleChange("title")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.title}
                helperText={errors.title}
              />
            </Box>

            {/* Severity + Status */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box ref={fieldRefs.severity}>
                <CustomInputLabel label="Severity" />
                <CustomSelect value={formData.severity} onChange={handleChange("severity")} fullWidth height="45px" inputBgColor="#fff">
                  {SEVERITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </CustomSelect>
                {errors.severity && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.severity}</Typography>}
              </Box>
              <Box ref={fieldRefs.status}>
                <CustomInputLabel label="Status" />
                <CustomSelect value={formData.status} onChange={handleChange("status")} fullWidth height="45px" inputBgColor="#fff">
                  {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </CustomSelect>
                {errors.status && <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.status}</Typography>}
              </Box>
            </Box>

            {/* Bug Description */}
            <Box>
              <CustomInputLabel label="Bug Description" />
              <TextInput placeholder="Describe the bug..." value={formData.description} onChange={handleChange("description")} inputBgColor="#fff" fullWidth multiline rows={3} />
            </Box>

            {/* Steps to Reproduce */}
            <Box>
              <CustomInputLabel label="Steps to Reproduce" />
              <TextInput placeholder="List steps to reproduce..." value={formData.stepsToReproduce} onChange={handleChange("stepsToReproduce")} inputBgColor="#fff" fullWidth multiline rows={3} />
            </Box>

            {/* Expected + Actual Behavior */}
            <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1, minWidth: 0 } }}>
              <Box>
                <CustomInputLabel label="Expected Behavior" />
                <TextInput placeholder="What should happen?" value={formData.expectedBehavior} onChange={handleChange("expectedBehavior")} inputBgColor="#fff" fullWidth multiline rows={3} />
              </Box>
              <Box>
                <CustomInputLabel label="Actual Behavior" />
                <TextInput placeholder="What actually happened?" value={formData.actualBehavior} onChange={handleChange("actualBehavior")} inputBgColor="#fff" fullWidth multiline rows={3} />
              </Box>
            </Box>

            {/* Environment */}
            <Box>
              <CustomInputLabel label="Environment" />
              <TextInput placeholder="e.g. Chrome v120, Windows 11" value={formData.environment} onChange={handleChange("environment")} inputBgColor="#fff" fullWidth />
            </Box>

            {/* Attachments / Screenshots */}
            <Box>
              <CustomInputLabel label="Attachments" />

              {formData.screenshots.length === 0 && (
                <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box component="label" sx={{ px: "14px", py: "6px", borderRadius: "8px", backgroundColor: "#F5F5F5", fontSize: "13px", fontWeight: 500, color: "#374151", cursor: "pointer", border: "1px solid #E0E0E0", whiteSpace: "nowrap", fontFamily: '"Poppins", sans-serif', "&:hover": { backgroundColor: "#EBEBEB" } }}>
                    Choose File
                    <input type="file" hidden accept="image/*" multiple onChange={handleAddScreenshots} />
                  </Box>
                  <Typography fontSize="13px" color="text.secondary">No file chosen</Typography>
                </Box>
              )}

              {formData.screenshots.length > 0 && (
                <Box sx={{ backgroundColor: "#fff", borderRadius: "14px", p: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "flex-start" }}>
                  {formData.screenshots.map((item, idx) => (
                    <Box key={idx} sx={{ width: 110, height: 90, borderRadius: "10px", position: "relative", flexShrink: 0 }}>
                      <Box component="label" sx={{ display: "block", width: "100%", height: "100%", cursor: "pointer" }} title="Click to replace">
                        <Box component="img" src={item.url} alt={`screenshot-${idx}`}
                          sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", borderRadius: "10px", border: "1px solid #E0E0E0", display: "block" }}
                        />
                        <input type="file" hidden accept="image/*" onChange={(e) => handleReplace(e, idx)} />
                      </Box>
                      <Box onClick={() => handleRemove(idx)} sx={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#FF0000", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", "&:hover": { backgroundColor: "#cc0000" } }}>
                        <X size={11} color="#fff" strokeWidth={3} />
                      </Box>
                    </Box>
                  ))}
                  <Box component="label" sx={{ width: 110, height: 90, borderRadius: "10px", border: "1.5px dashed #D1D5DB", backgroundColor: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, cursor: "pointer", flexShrink: 0, transition: "all 0.2s", "&:hover": { backgroundColor: "#F3F4F6", borderColor: "#AA2493" } }}>
                    <ImagePlus size={24} color="#9CA3AF" />
                    <Typography fontSize="10px" color="text.secondary" textAlign="center" lineHeight={1.3}>Add image</Typography>
                    <input type="file" hidden accept="image/*" multiple onChange={handleAddScreenshots} />
                  </Box>
                </Box>
              )}
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText={isEdit ? "Save Changes" : "Submit Bug Report"}
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={isEdit ? "Bug report updated successfully" : "Bug report submitted successfully"}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default AddBugReport;