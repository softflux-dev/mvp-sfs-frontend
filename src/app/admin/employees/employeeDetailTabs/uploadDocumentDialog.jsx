// employees/employeeDetailTabs/uploadDocumentDialog.jsx
import { useRef, useState } from "react";
import { Box, MenuItem, Typography, CircularProgress } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../../components";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import TextInput           from "../../../../components/textInput";
import CustomSelect        from "../../../../components/customSelect";
import CustomInputLabel    from "../../../../components/customInputLabel";
import CustomButton        from "../../../../components/customButton";
import SuccessPopup        from "../../../../components/popups/confirmationDialog";

const DOCUMENT_TYPES = [
  { value: "employment_contract", label: "Employment Contract" },
  { value: "nda",                 label: "NDA"                 },
  { value: "id_document",         label: "ID Document"         },
  { value: "other",               label: "Other"               },
];

const EMPTY_FORM = {
  title:        "",
  documentType: "",
  file:         null,
};

const UploadDocumentDialog = ({ open, onClose, onSave, loading = false }) => {
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [successOpen, setSuccessOpen] = useState(false);
  const fileInputRef = useRef(null);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    onClose();
  };

  const handleSave = () => {
    onSave?.(form);
    setForm({ ...EMPTY_FORM });
    onClose();
    setSuccessOpen(true);
  };

  return (
    <>
      <DialogContainer open={open} onClose={handleClose} maxWidth="500px" fullWidth>
        <DialogHeader title="Upload Document" onClose={handleClose} />

        <DialogBody>
          <Box
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "16px",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* ── Title ──────────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Title" />
              <TextInput
                placeholder="Enter Title"
                value={form.title}
                onChange={set("title")}
                inputBgColor="#fff"
                fullWidth
              />
            </Box>

            {/* ── Type ───────────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Type" />
              <CustomSelect
                value={form.documentType}
                onChange={set("documentType")}
                fullWidth
                height="45px"
                inputBgColor="#fff"
                displayEmpty
                renderValue={(v) =>
                  DOCUMENT_TYPES.find((t) => t.value === v)?.label || (
                    <Typography fontSize={13} color="text.secondary">
                      Select Type
                    </Typography>
                  )
                }
              >
                {DOCUMENT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Box>

            {/* ── File ───────────────────────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="File" />

              {/* Hidden native file input — triggered by CustomButton below */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  px: 1.5,
                  py: 1,
                  minHeight: "45px",
                }}
              >
                <CustomButton
                  btnLabel="Choose File"
                  variant="chooseFile"
                  handlePressBtn={() => fileInputRef.current?.click()}
                />

                <Typography
                  fontSize="13px"
                  color={form.file ? "text.primary" : "text.secondary"}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {form.file ? form.file.name : "No file chosen"}
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
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : "Save"
        }
        isConfirmBtnDisable={!form.title || !form.file || loading}
        variant="gradient"
      />
      </DialogContainer>

      {/* ── Upload success popup ──────────────────────────────────────────── */}
      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Save Successfully"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default UploadDocumentDialog;