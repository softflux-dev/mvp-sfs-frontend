import { useState, useRef } from "react";
import { Box, Avatar, Stack, Typography, IconButton } from "@mui/material";
import DeleteIcon from "../../../../assets/icons/delete-icon-inactive.svg";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";       // forwardRef — Cancel/Yes
import SuccessPopup       from "../../../../components/popups/confirmationDialog"; // auto-close success

const mockMembers = [
  { id: 1, name: "Product Catalog", role: "Developer",       assigned: 12, completed: 9,  avatar: "" },
  { id: 2, name: "Sara Ahmed",      role: "QA Engineer",     assigned: 8,  completed: 4,  avatar: "" },
  { id: 3, name: "Sara Ahmed",      role: "Designer",        assigned: 15, completed: 10, avatar: "" },
  { id: 4, name: "Sara Ahmed",      role: "Project Manager", assigned: 2,  completed: 1,  avatar: "" },
  { id: 5, name: "Sara Ahmed",      role: "QA Engineer",     assigned: 20, completed: 19, avatar: "" },
  { id: 6, name: "Sara Ahmed",      role: "Developer",       assigned: 1,  completed: 1,  avatar: "" },
  { id: 7, name: "Sara Ahmed",      role: "Designer",        assigned: 0,  completed: 0,  avatar: "" },
];

const tableHeader = [
  { id: "member",    label: "Member"    },
  { id: "role",      label: "Role"      },
  { id: "assigned",  label: "Assigned"  },
  { id: "completed", label: "Completed" },
  { id: "actions",   label: "Actions"   },
];

const displayRows = [
  "team_member",    // custom → avatar + name
  "role",           // default → plain text
  "assigned",       // default → plain text
  "completed",      // default → plain text
  "actions",    
];

const TeamTab = ({ project = {} }) => {
  const [members,       setMembers]       = useState(mockMembers);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDialogRef = useRef();

  const handleDelete = (row) => {
    confirmDialogRef.current?.open({
      title: "Confirmation !",
      description: "Are you sure you want to Delete this ?",
      confirmText: "Yes",
      cancelText: "Cancel",
      onConfirm: () => {
        setMembers((prev) => prev.filter((m) => m.id !== row.id));
        setDeleteSuccess(true);
      },
    });
  };

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Filter row ───────────────────────────────────────────────────── */}
      <Box mb={2}>
        <Filter mode="team" onFilterChange={() => {}} />
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
            tableHeader={tableHeader}
            tableData={members}
            displayRows={displayRows}
            onDeleteClick={handleDelete}   
             deleteIcon={DeleteIcon}
            isLoading={false}
            />
      </Box>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmationDialog ref={confirmDialogRef} />

      {/* ── Delete success ────────────────────────────────────────────────── */}
      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Successfully Deleted."
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default TeamTab;