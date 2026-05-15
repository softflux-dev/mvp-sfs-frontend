// app/admin/roles/selectPagesDialog.jsx
import { useState, useEffect } from "react";
import { Box, Grid, MenuItem, Typography } from "@mui/material";
import {
  DialogContainer,
  DialogHeader,
  DialogBody,
} from "../../../components";
import { TextInput, CustomSelect } from "../../../components";
import CustomCheckbox     from "../../../components/customChecked";
import DialogActionButtons from "../../../components/dialog/dialogAction";
import {
  adminPages,
  hrPages,
  projectManagerPages,
  employeePages,
} from "./pagesData";

// ── Portal sections config ────────────────────────────────────────────────────
const PORTAL_SECTIONS = [
  { key: "Admin",           label: "Admin Portal",           color: "#AA2493", data: adminPages          },
  { key: "HR",              label: "HR Portal",              color: "#AA2493", data: hrPages              },
  { key: "Project Manager", label: "Project Manager Portal", color: "#AA2493", data: projectManagerPages  },
  { key: "Employee",        label: "Employee Portal",        color: "#AA2493", data: employeePages        },
];

const SelectPagesDialog = ({
  open,
  onClose,
  formData,
  editingRole,
  onSaveSuccess,
  loading,
}) => {
  const [searchText,     setSearchText]     = useState("");
  const [selectedPortal, setSelectedPortal] = useState("all");
  const [selectedPages,  setSelectedPages]  = useState([]);

  const isEditMode = !!editingRole;

  // Pre-populate pages when editing
  useEffect(() => {
    if (open && editingRole?.pages?.length) {
      setSelectedPages(editingRole.pages);
    } else if (!open) {
      setSelectedPages([]);
      setSearchText("");
      setSelectedPortal("all");
    }
  }, [open, editingRole]);

  const filterData = (data) => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const shouldShow = (portalKey) =>
    selectedPortal === "all" || selectedPortal === portalKey;

  const handleCheck = (item, checked) => {
    if (checked) {
      setSelectedPages((prev) => [...prev, item]);
    } else {
      setSelectedPages((prev) =>
        prev.filter((p) => !(p.id === item.id && p.path === item.path))
      );
    }
  };

  const isSelected = (item) =>
    selectedPages.some((p) => p.id === item.id && p.path === item.path);

  const handleSave = () => {
    onSaveSuccess?.(selectedPages);
    setSelectedPages([]);
    setSearchText("");
    setSelectedPortal("all");
  };

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      maxWidth="600px"
      disableBackdropClick
    >
      <DialogHeader
        title={isEditMode ? "Edit Role Pages" : "Select Pages"}
        onClose={onClose}
      />

      <DialogBody>
        <Box bgcolor="primary.lightGray" px={2} py={1} borderRadius="10px">

      

          {/* ── Portal sections ─────────────────────────────────────────── */}
          {PORTAL_SECTIONS.map((section) =>
            shouldShow(section.key) ? (
              <Box key={section.key} mt={2}>
                <Typography
                  color={section.color}
                  fontWeight={500}
                  fontSize="18px"
                  mb={0.5}
                >
                  {section.label}
                </Typography>
                {filterData(section.data).map((item) => (
                  <Box
                    key={item.id}
                    bgcolor="secondary.contrastText"
                    px={2}
                    py={1}
                    borderRadius="10px"
                    mt={1.5}
                  >
                    <CustomCheckbox
                      label={item.title}
                      fontSize="16px"
                      fontWeight={500}
                      labelColor="text.color"
                      checked={isSelected(item)}
                      onChange={(e) => handleCheck(item, e.target.checked)}
                    />
                  </Box>
                ))}
              </Box>
            ) : null
          )}

        </Box>
      </DialogBody>

      <DialogActionButtons
        onConfirm={handleSave}
        onCancel={onClose}
        confirmText="Save Role"
        cancelText="Cancel"
        confirmLoading={loading}
      />
    </DialogContainer>
  );
};

export default SelectPagesDialog;