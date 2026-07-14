// app/admin/roles/selectPagesDialog.jsx
import { useState, useEffect } from "react";
import { Box, Typography, Checkbox } from "@mui/material";
import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import TextInput           from "../../../components/textInput";
import { ALL_PAGE_GROUPS } from "./pagesData";


const SelectPagesDialog = ({
  open,
  onClose,
  formData,
  editingRole   = null,
  onSaveSuccess,
  loading       = false,
}) => {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState([]); 

  // Pre-populate when editing
  useEffect(() => {
    if (!open) return;
    if (editingRole?.pages?.length) {
      // Match existing pages against our page list by path
      const flat = ALL_PAGE_GROUPS.flatMap((g) => g.pages);
      const matched = editingRole.pages
        .map((p) => flat.find((fp) => fp.path === p.path || fp.id === p.id))
        .filter(Boolean);
      setSelected(matched);
    } else {
      setSelected([]);
    }
    setSearch("");
  }, [open, editingRole]);

const toggle = (page) => {
    if (page.id === "emp-profile") return;   
    setSelected((prev) =>
      prev.some((p) => p.id === page.id)
        ? prev.filter((p) => p.id !== page.id)
        : [...prev, page]
    );
  };

 const isSelected = (page) =>
    page.id === "emp-profile" || selected.some((p) => p.id === page.id);

 const handleSave = () => {
    const PROFILE_PAGE = { id: "emp-profile", title: "Profile", path: "/profile" };
    const withoutProfile = selected.filter((p) => p.id !== "emp-profile");
    const pages = [PROFILE_PAGE, ...withoutProfile].map((p) => ({
      id:    p.id,
      title: p.title,
      path:  p.path,
    }));
    onSaveSuccess?.(pages);
  };

  const filterPages = (pages) => {
    if (!search.trim()) return pages;
    return pages.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <DialogContainer open={open} onClose={onClose} maxWidth="520px" fullWidth>
      <DialogHeader
        title={editingRole ? "Edit Role Pages" : "Select Pages"}
        onClose={onClose}
      />

      <DialogBody>
        <Box sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "16px",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>

          {/* Search */}
          <TextInput
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputBgColor="#fff"
            fullWidth
          />

          {/* Selected count */}
          <Typography fontSize="12px" color="text.secondary">
            {selected.length} page{selected.length !== 1 ? "s" : ""} selected
          </Typography>

          {/* Page groups */}
          {ALL_PAGE_GROUPS.map((group) => {
            const filtered = filterPages(group.pages);
            if (!filtered.length) return null;

            return (
              <Box key={group.label}>
                <Typography
                  fontSize="13px"
                  fontWeight={700}
                  mb={1}
                  sx={{ color: group.color }}
                >
                  {group.label}
                </Typography>

                <Box display="flex" flexDirection="column" gap={0.5}>
                {filtered.map((page) => {
                    const locked = page.id === "emp-profile";
                    return (
                      <Box
                        key={page.id}
                        onClick={() => toggle(page)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          backgroundColor: isSelected(page) ? "#F0E8FA" : "#fff",
                          borderRadius: "10px",
                          px: 2,
                          py: 1,
                          cursor: locked ? "default" : "pointer",
                          border: isSelected(page)
                            ? "1px solid #AA2493"
                            : "1px solid transparent",
                          transition: "all 0.15s ease",
                          "&:hover": { backgroundColor: locked ? "#F0E8FA" : "#F0E8FA" },
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected(page)}
                          disabled={locked}
                          onChange={() => toggle(page)}
                          disableRipple
                          sx={{
                            p: 0,
                            color: "#D1D5DB",
                            "&.Mui-checked": { color: "#AA2493" },
                            "&.Mui-disabled.Mui-checked": { color: "#AA2493" },
                          }}
                        />
                        <Typography fontSize="13px" fontWeight={500} color="text.primary">
                          {page.title}
                        </Typography>
                        {locked && (
                          <Typography fontSize="10px" fontWeight={600} color="#AA2493"
                            sx={{ backgroundColor: "#F0E8FA", px: 1, py: 0.2, borderRadius: "6px" }}
                          >
                            Always included
                          </Typography>
                        )}
                        <Typography fontSize="11px" color="text.secondary" ml="auto">
                          {page.path}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={onClose}
        onConfirm={handleSave}
        showCancelBtn
        cancelText="Back"
        confirmText="Save Role"
        variant="gradient"
        confirmLoading={loading}
        isConfirmBtnDisable={selected.length === 0 || loading}
      />
    </DialogContainer>
  );
};

export default SelectPagesDialog;