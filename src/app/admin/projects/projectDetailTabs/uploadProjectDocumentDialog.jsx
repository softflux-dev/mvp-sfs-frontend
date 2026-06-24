// employees/projectDetailTabs/uploadProjectDocumentDialog.jsx — NEW FILE
import { useState, useEffect} from "react";
import { Box, MenuItem, Typography, Avatar, Checkbox, CircularProgress } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  CustomSelect,
  TextInput,
} from "../../../../components";
import CustomInputLabel    from "../../../../components/customInputLabel";
import DialogActionButtons from "../../../../components/dialog/dialogAction";
import UploadBox           from "../../../../components/uploadBox";
import UploadIcon          from "../../../../assets/icons/upload.svg";

const DOC_TYPE_OPTIONS = [
  { value: "project_documentation", label: "Project Documentation" },
  { value: "design_assets",         label: "Design Assets"         },
  { value: "requirements",          label: "Requirements"          },
  { value: "other",                 label: "Other"                 },
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const multiMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: "14px",
      mt: 0.5,
      boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
      maxHeight: 280,
    },
  },
};

const INITIAL_FORM = {
  title:       "",
  type:        "",
  assigneeIds: [],
  files:       [],
};

/**
 * UploadProjectDocumentDialog
 *
 * teamOptions: [{ _id, fullName, avatar, role }] — restricted to THIS
 * project's team members (from TeamTab) + the assigned Project Manager.
 * Selecting one or more employees here shares the document into their
 * My Documents (via SharedDocument mirror, handled server-side).
 */
const UploadProjectDocumentDialog = ({
  open,
  onClose,
  onSave,
  loading      = false,
  teamOptions  = [],
}) => {
  const [formData,   setFormData]   = useState(INITIAL_FORM);
  const [errors,     setErrors]     = useState({});
  const [dragActive, setDragActive] = useState(false);

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleChange = (field) => (e) => set(field, e?.target ? e.target.value : e);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...selected] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...dropped] }));
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleRemoveFile = (index) =>
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Document title is required";
    if (!formData.type)         e.type  = "Document type is required";
    if (!formData.files.length) e.files = "Please select at least one file";
    // assigneeIds intentionally optional — Admin/PM may upload a project
    // doc without sharing it to anyone yet.
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave?.(formData);
    
  };

  // Reset form when dialog closes (parent-driven)
  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM);
      setErrors({});
    }
  }, [open]);

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose?.();
  };

  const renderMultiAssigneeValue = (selected) => {
    if (!selected?.length)
      return <Typography fontSize={13} color="text.secondary">Select team members (optional)</Typography>;
    const matched = teamOptions.filter((m) => selected.includes(m._id));
    return (
      <Box display="flex" alignItems="center" gap={0.75} flexWrap="nowrap" overflow="hidden">
        <Box display="flex" sx={{ "& > *:not(:first-of-type)": { ml: -0.75 } }}>
          {matched.slice(0, 4).map((m) => (
            <Avatar key={m._id} src={m.avatar}
              sx={{ width: 22, height: 22, fontSize: "9px", fontWeight: 700,
                background: "linear-gradient(135deg, #AA2493, #022179)",
                color: "#fff", border: "1.5px solid #fff" }}
            >{getInitials(m.fullName)}</Avatar>
          ))}
        </Box>
        <Typography fontSize={13} color="text.primary" noWrap>
          {matched.length === 1 ? matched[0].fullName : `${matched[0].fullName} +${matched.length - 1} more`}
        </Typography>
      </Box>
    );
  };

  return (
   <DialogContainer open={open} onClose={!loading ? handleClose : undefined} maxWidth="580px" fullWidth>

     {/* Loader overlay */}
      {loading && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: "inherit",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 1.5,
        }}>
          <CircularProgress size={40} sx={{ color: "#AA2493" }} />
          <Typography fontSize={14} fontWeight={500} color="text.secondary">
            Uploading document…
          </Typography>
        </Box>
      )}


      <DialogHeader title="Upload Project Document" onClose={handleClose} />

      <Box
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 3, mx: 3, mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          maxHeight: "62vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "4px" },
        }}
      >
        {/* Document Title */}
        <Box>
          <CustomInputLabel label="Document Title" />
          <TextInput
            placeholder="Enter document title"
            value={formData.title}
            onChange={handleChange("title")}
            inputBgColor="#fff"
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
          />
        </Box>

        {/* Document Type */}
        <Box>
          <CustomInputLabel label="Document Type" />
          <CustomSelect
            value={formData.type}
            onChange={handleChange("type")}
            fullWidth height="45px" inputBgColor="#fff"
          >
            <MenuItem value="">Select type</MenuItem>
            {DOC_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </CustomSelect>
          {errors.type && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.type}</Typography>
          )}
        </Box>

        {/* Share with team members — multi-select, restricted to this project's team + PM */}
        <Box>
          <CustomInputLabel label="Share With (Team Members)" />
          <CustomSelect
            multiple
            value={formData.assigneeIds}
            onChange={(e) => setFormData((prev) => ({ ...prev, assigneeIds: e.target.value }))}
            fullWidth height="45px" inputBgColor="#fff"
            displayEmpty
            renderValue={renderMultiAssigneeValue}
            MenuProps={multiMenuProps}
          >
            {teamOptions.length === 0 ? (
              <MenuItem disabled value=""><em>No team members on this project yet</em></MenuItem>
            ) : (
              teamOptions.map((member) => {
                const isSelected = formData.assigneeIds.includes(member._id);
                return (
                  <MenuItem
                    key={member._id} value={member._id} disableRipple
                    sx={{
                      px: 1.5, py: 1, gap: 1.5,
                      backgroundColor: isSelected ? "#F9FAFB" : "transparent",
                      "&:hover": { backgroundColor: "#F5F5F5" },
                      "&.Mui-selected": { backgroundColor: "#F9FAFB" },
                      "&.Mui-selected:hover": { backgroundColor: "#F5F5F5" },
                    }}
                  >
                    <Avatar src={member.avatar}
                      sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 600,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        color: "#fff", flexShrink: 0 }}
                    >{getInitials(member.fullName)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontSize="13px" fontWeight={500} color="text.primary">
                        {member.fullName}
                      </Typography>
                      {member.role && (
                        <Typography fontSize="11px" color="text.secondary">
                          {member.role}
                        </Typography>
                      )}
                    </Box>
                    <Checkbox
                      checked={isSelected} disableRipple
                      sx={{ p: 0, color: "#D1D5DB", "&.Mui-checked": { color: "#AA2493" }, "& .MuiSvgIcon-root": { fontSize: 20 } }}
                    />
                  </MenuItem>
                );
              })
            )}
          </CustomSelect>
          <Typography fontSize="11px" color="text.secondary" mt={0.5} ml={0.5}>
            Selected members will see this document in their My Documents.
          </Typography>
        </Box>

        {/* File Upload */}
        <Box>
          <CustomInputLabel label="File" />
          <UploadBox
            uploadIcon={UploadIcon}
            dragActive={dragActive}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            selectedFiles={formData.files}
            onRemoveFile={handleRemoveFile}
            showCategory={false}
            showFileList={true}
          />
          {errors.files && (
            <Typography fontSize="12px" color="error" mt={0.5} ml={0.5}>{errors.files}</Typography>
          )}
        </Box>
      </Box>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Cancel"
        confirmText="Upload"
        variant="gradient"
        confirmLoading={loading}
        disabled={loading} 
      />
    </DialogContainer>
  );
};

export default UploadProjectDocumentDialog;