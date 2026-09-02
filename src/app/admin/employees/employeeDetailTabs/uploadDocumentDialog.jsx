// employees/employeeDetailTabs/uploadDocumentDialog.jsx
// CHANGED: file box now matches UploadProjectDocumentDialog — supports
// selecting/dropping multiple files at once, shows each as a removable
// chip/row, and lets the user keep adding more via "Choose Files". Submits
// as formData.files (array) instead of a single formData.file; useDocument's
// uploadDocument already handles the array (falls back to single `file`
// for backward compatibility, so nothing else needs to change).
import { useRef, useState } from "react";
import { Box, MenuItem, Typography, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
  files:        [],
};

const UploadDocumentDialog = ({ open, onClose, onSave, loading = false }) => {
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [successOpen, setSuccessOpen] = useState(false);
  const fileInputRef = useRef(null);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Append newly chosen files to whatever's already selected, instead of
  // replacing — lets the user click "Choose Files" more than once. ─────────
  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setForm((prev) => ({ ...prev, files: [...prev.files, ...picked] }));
    // reset the input so choosing the same file again still fires onChange
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
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

            {/* ── Files (multi-select) ──────────────────────────────────── */}
            <Box>
              <CustomInputLabel label="Files" />

              {/* Hidden native file input — `multiple` lets the OS picker
                  select several files in one go; triggered by the button. */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
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
                  btnLabel="Choose Files"
                  variant="chooseFile"
                  handlePressBtn={() => fileInputRef.current?.click()}
                />

                <Typography fontSize="13px" color="text.secondary">
                  {form.files.length
                    ? `${form.files.length} file${form.files.length > 1 ? "s" : ""} selected`
                    : "No files chosen"}
                </Typography>
              </Box>

              {/* ── Selected files list — each removable individually ───── */}
              {form.files.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 1.5,
                  }}
                >
                  {form.files.map((file, index) => (
                    <Box
                      key={`${file.name}-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        px: 1.5,
                        py: 0.75,
                      }}
                    >
                      <Typography
                        fontSize="13px"
                        color="text.primary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "380px",
                        }}
                      >
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        sx={{ p: 0.5 }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
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
        confirmText={
          loading
            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
            : "Save"
        }
        isConfirmBtnDisable={!form.title || !form.files.length || loading}
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