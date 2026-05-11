import { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Paperclip, Image } from "lucide-react";

import TextInput        from "../../../components/textInput";
import CustomButton     from "../../../components/customButton";
import CustomInputLabel from "../../../components/customInputLabel";
import AttachmentCard   from "../../../components/cards/attachmentCard";
import UploadIcon          from "../../../assets/icons/upload.svg";
import fileIcon            from "../../../assets/icons/file-icon.svg";

// ── Mock previously submitted work ───────────────────────────────────────
const mockPreviousWork = [
  { id: 1, type: "link", value: "https://github.com/company/client-portal/pull/42", date: "Mar 17, 9:45 PM" },
  { id: 2, type: "file", value: "auth-schema.sql",                                  date: ""               },
];

const INITIAL_FORM = {
  codeRepo:     "",
  demoLink:     "",
  uploadedFile: null,
  screenshots:  null,
};

// ── Reusable dashed upload button matching Figma ──────────────────────────
const UploadButton = ({ icon: Icon, label, file, inputRef, onChange }) => (
  <Box
    onClick={() => inputRef.current?.click()}
    sx={{
      flex: 1,
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      border: "1px dashed #ADADAD",
      borderRadius: "15px",
      backgroundColor: "#fff",
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": { borderColor: "#AA2493", backgroundColor: "#AA24930A" },
    }}
  >
    <img src={UploadIcon} alt="upload" style={{ width: 16, height: 16 }} />
    <Typography
      fontSize="13px"
      fontWeight={500}
      noWrap
      sx={{ color: file ? "#030229" : "#ADADAD" }}
    >
      {file ? file.name : label}
    </Typography>
    <input ref={inputRef} type="file" hidden onChange={onChange} />
  </Box>
);

const EmpSubmitWork = ({ onSubmit, loading = false }) => {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const fileRef       = useRef();
  const screenshotRef = useRef();

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, [field]: file }));
  };

  const validate = () => {
    const e = {};
    if (!form.codeRepo.trim() && !form.demoLink.trim() && !form.uploadedFile)
      e.codeRepo = "Please provide at least a repo link, demo link, or file";
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit?.(form);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, mb: 3 }}>
      <Typography fontSize="16px" fontWeight={700} color="text.primary" mb={2.5}>
        Submit Your Work
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>

        {/* Code Repository */}
        <Box>
          <CustomInputLabel label="Code Repository" />
          <TextInput
            placeholder="Paste GitHub/GitLab repo link"
            value={form.codeRepo}
            onChange={handleChange("codeRepo")}
            inputBgColor="#F5F5F5"
            fullWidth
            error={!!errors.codeRepo}
            helperText={errors.codeRepo}
          />
        </Box>

        {/* Demo / Live Link */}
        <Box>
          <CustomInputLabel label="Demo / Live Link" />
          <TextInput
            placeholder="Paste demo or staging URL"
            value={form.demoLink}
            onChange={handleChange("demoLink")}
            inputBgColor="#F5F5F5"
            fullWidth
          />
        </Box>

        {/* ── Upload File + Upload Screenshots ── dashed border boxes ──── */}
        <Box display="flex" gap={2}>
          <UploadButton
            icon={Paperclip}
            label="Upload File"
            file={form.uploadedFile}
            inputRef={fileRef}
            onChange={handleFileChange("uploadedFile")}
          />
          <UploadButton
            icon={Image}
            label="Upload Screenshots"
            file={form.screenshots}
            inputRef={screenshotRef}
            onChange={handleFileChange("screenshots")}
          />
        </Box>

        {/* Submit Work */}
        <CustomButton
          btnLabel="Submit Work"
          variant="gradient"
          handlePressBtn={handleSubmit}
          fullWidth
          sx={{ height: "48px", fontSize: "15px", fontWeight: 600 }}
        />
      </Box>

      {/* Previously Submitted Work */}
      {mockPreviousWork.length > 0 && (
        <Box mt={3}>
          <Typography fontSize="15px" fontWeight={700} color="text.primary" mb={1.5}>
            Previously Submitted Work
          </Typography>
          <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", overflow: "hidden" }}>
            {mockPreviousWork.map((item, idx) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2, py: 1.2,
                  borderBottom: idx < mockPreviousWork.length - 1 ? "1px solid #E8E8E8" : "none",
                  gap: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} overflow="hidden">
                  {item.type === "link" ? (
                    <Box
                             sx={{
                               width: 36, height: 36,
                               backgroundColor: "#fff",
                               borderRadius: "8px",
                               display: "flex",
                               alignItems: "center",
                               justifyContent: "center",
                               flexShrink: 0,
                             }}
                           >
                    <Paperclip size={14} color="#67768B" style={{ flexShrink: 0 }} />
                    </Box>
                  ) : (
                    <Box
                             sx={{
                               width: 36, height: 36,
                               backgroundColor: "#fff",
                               borderRadius: "8px",
                               display: "flex",
                               alignItems: "center",
                               justifyContent: "center",
                               flexShrink: 0,
                             }}
                           >
                             <img src={fileIcon} alt="file" style={{ width: 18, height: 18 }} />
                           </Box>
                  )}
                  <Typography
                    fontSize="12px" fontWeight={500} noWrap
                    sx={{
                      color: item.type === "link" ? "#2B6EFF" : "#030229",
                      cursor: item.type === "link" ? "pointer" : "default",
                      "&:hover": item.type === "link" ? { textDecoration: "underline" } : {},
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
                {item.date && (
                  <Typography fontSize="11px" color="text.secondary" whiteSpace="nowrap" flexShrink={0}>
                    {item.date}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Attachments from PM */}
      <Box mt={3}>
        <Typography fontSize="15px" fontWeight={700} color="text.primary" mb={1.5}>
          Attachments from PM
        </Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <AttachmentCard
            fileName="wireframe-v2.fig"
            fileSize="installation-guide.pdf"
            onDownload={() => console.log("Download wireframe")}
          />
          <AttachmentCard
            fileName="requirements.pdf"
            fileSize="installation-guide.pdf"
            onDownload={() => console.log("Download requirements")}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmpSubmitWork;