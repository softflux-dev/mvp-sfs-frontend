import { useState, useRef, useEffect } from "react";
import { Box, Typography }             from "@mui/material";

import CustomButton       from "../../../../components/customButton";
import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";
import AddTeamMember      from "./addTeamMember";

import {
  getProjectTeamApi,
  removeTeamMemberApi,
  addTeamMembersApi,
} from "../../../../api/modules/project";
import { getEmployeesApi } from "../../../../api/modules/employee";
import DeleteIcon from "../../../../assets/icons/delete-icon-inactive.svg";

const tableHeader = [
  { id: "member",    label: "Member"    },
  { id: "role",      label: "Role"      },
  { id: "assigned",  label: "Assigned"  },
  { id: "completed", label: "Completed" },
  { id: "actions",   label: "Actions"   },
];

const displayRows = [
  "team_member",
  "role",
  "assigned",
  "completed",
  "actions",
];

const TeamTab = ({ project = {}, onTeamChange }) => {
  const [members,       setMembers]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [search,        setSearch]        = useState("");
  const [allEmployees,     setAllEmployees]      = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [addOpen,    setAddOpen]    = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError,   setAddError]   = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  const confirmDialogRef = useRef();

  const fetchTeam = async () => {
    if (!project.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await getProjectTeamApi(project.id);
      if (res?.status === 200 || res?.status === 201) {
        const team = res.data.data.team || [];
        setMembers(team);
        onTeamChange?.(team);             // ← notify parent
      } else {
        setError(res?.data?.message || "Failed to fetch team.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployeesApi({ limit: 1000 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setAllEmployees(res.data.data.employees || []);
      }
    });
  }, []);

  useEffect(() => { fetchTeam(); }, [project.id]);

  const handleAddSave = async (selectedIds) => {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await addTeamMembersApi(project.id, selectedIds);
      if (res?.status === 200 || res?.status === 201) {
        await fetchTeam();               // fetchTeam already calls onTeamChange
        setAddSuccess(true);
        setAddOpen(false);
      } else {
        setAddError(res?.data?.message || "Failed to add members.");
      }
    } catch {
      setAddError("Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = members.filter((m) => {
    const matchesSearch = search.trim()
      ? m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesEmployee = selectedEmployee ? m._id === selectedEmployee : true;
    return matchesSearch && matchesEmployee;
  });

  const tableData = filtered.map((m) => ({
    id:        m._id,
    name:      m.name,
    avatar:    m.avatar,
    role:      m.role,
    assigned:  m.assigned,
    completed: m.completed,
  }));

  const handleDelete = (row) => {
    confirmDialogRef.current?.open({
      title:       "Remove Team Member?",
      description: `"${row.name}" will be removed from this project.`,
      confirmText: "Yes, Remove",
      cancelText:  "Cancel",
      onConfirm: async () => {
        try {
          const res = await removeTeamMemberApi(project.id, row.id);
          if (res?.status === 200 || res?.status === 201) {
            const updated = members.filter((m) => m._id !== row.id);
            setMembers(updated);
            onTeamChange?.(updated);    // ← notify parent on removal too
            setDeleteSuccess(true);
          } else {
            setError(res?.data?.message || "Failed to remove member.");
          }
        } catch {
          setError("Something went wrong.");
        }
      },
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box flex={1}>
          <Filter
            mode="team"
            employees={members} 
            onFilterChange={(f) => {
              setSearch(f.search || "");
              setSelectedEmployee(f.employee || "");
            }}
          />
        </Box>
        <CustomButton
          btnLabel="+ Add Member"
          variant="gradient"
          handlePressBtn={() => { setAddError(""); setAddOpen(true); }}
        />
      </Box>

      {error && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      <Box bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          onDeleteClick={handleDelete}
          deleteIcon={DeleteIcon}
          isLoading={loading}
        />
      </Box>

      <AddTeamMember
        open={addOpen}
        onClose={() => { setAddOpen(false); setAddError(""); }}
        onSave={handleAddSave}
        loading={addLoading}
        apiError={addError}
      />

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Team member removed successfully."
        autoClose autoCloseDelay={2000}
      />
      <SuccessPopup
        open={addSuccess}
        onClose={() => setAddSuccess(false)}
        message="Team members added successfully."
        autoClose autoCloseDelay={2000}
      />
    </Box>
  );
};

export default TeamTab;