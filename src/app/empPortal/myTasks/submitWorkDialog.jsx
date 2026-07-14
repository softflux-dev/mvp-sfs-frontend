import { useState, useEffect, useRef } from "react";
import { Box,Typography } from "@mui/material";

import {
  DialogContainer,
  DialogHeader,
  DialogBody,
  TextInput,
} from "../../../components";
import CustomInputLabel    from "../../../components/customInputLabel";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

const INITIAL_FORM = {
  title:       "",
  description: "",
  link:        "",
  attachments: null,
};

const SubmitWorkDialog = ({ open, onClose, onSave, taskTitle = "", loading = false }) => {
  const [formData,    setFormData]    = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const fieldRefs = {
    title: useRef(null),
  };

  useEffect(() => {
    if (!open) return;
    setFormData({ ...INITIAL_FORM, title: taskTitle });
    setErrors({});
  }, [open, taskTitle]);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Title is required";
    return e;
  };

  const FIELD_ORDER = ["title"];

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstErrorField = FIELD_ORDER.find((f) => validationErrors[f]);
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
      <DialogContainer open={open} onClose={handleClose} maxWidth="560px" fullWidth>
        <DialogHeader title="Submit Your Work" onClose={handleClose} />

        <DialogBody>
          <Box sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: "16px",
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>

            {/* Title */}
            <Box ref={fieldRefs.title}>
              <CustomInputLabel label="Title *" />
              <TextInput
                placeholder="Enter title"
                value={formData.title}
                onChange={handleChange("title")}
                inputBgColor="#fff"
                fullWidth
                error={!!errors.title}
                helperText={errors.title}
              />
            </Box>

            {/* Description */}
            <Box>
              <CustomInputLabel label="Description" />
              <TextInput
                placeholder="Describe the Project..."
                value={formData.description}
                onChange={handleChange("description")}
                inputBgColor="#fff"
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            {/* Link */}
            <Box>
              <CustomInputLabel label="Link (Option)" />
              <TextInput
                placeholder="Paste demo or staging URL"
                value={formData.link}
                onChange={handleChange("link")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* Attachments */}
            <Box>
              <CustomInputLabel label="Attachments" />
              <Box sx={{
                backgroundColor: "#fff",
                borderRadius: "14px",
                px: 2, py: 1.5,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
              }}>
                <Box
                  component="label"
                  sx={{
                    px: "14px", py: "6px",
                    borderRadius: "8px",
                    backgroundColor: "#F5F5F5",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#374151",
                    cursor: "pointer",
                    border: "1px solid #E0E0E0",
                    whiteSpace: "nowrap",
                    fontFamily: '"Poppins", sans-serif',
                    "&:hover": { backgroundColor: "#EBEBEB" },
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, attachments: e.target.files?.[0] || null }))
                    }
                  />
                </Box>
                <Typography fontSize="13px" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  {formData.attachments ? formData.attachments.name : "No file Screenshots"}
                </Typography>
              </Box>
            </Box>

          </Box>
        </DialogBody>

        <DialogActionButtons
          onCancel={handleClose}
          onConfirm={handleSave}
          showCancelBtn
          cancelText="Cancel"
          confirmText="Submit Work"
          variant="gradient"
          confirmLoading={loading}
        />
      </DialogContainer>

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Work submitted successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default SubmitWorkDialog;