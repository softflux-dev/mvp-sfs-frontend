import { useState, useRef, useEffect } from "react";
import { Box, Typography }             from "@mui/material";

import Filter             from "../../../../components/filterBar/filter";
import PaginatedTable     from "../../../../components/dynamicTable";
import ConfirmationDialog from "../../../../components/popups/confirmation";
import SuccessPopup       from "../../../../components/popups/confirmationDialog";

import { getProjectTeamApi, removeTeamMemberApi } from "../../../../api/modules/project";
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

const TeamTab = ({ project = {} }) => {
  const [members,       setMembers]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [search,        setSearch]        = useState("");
  const [allEmployees,     setAllEmployees]      = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const confirmDialogRef = useRef();

  // ── Fetch team ────────────────────────────────────────────────────────────
const fetchTeam = async () => {
  if (!project.id) return;  
  setLoading(true);
  setError("");
  try {
    const res = await getProjectTeamApi(project.id);
    if (res?.status === 200 || res?.status === 201) {
      setMembers(res.data.data.team || []);
    } else {
      setError(res?.data?.message || "Failed to fetch team.");
    }
  } catch (err) {
    console.log("fetchTeam error:", err);  
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
    import("../../../../api/modules/employee").then(({ getEmployeesApi }) => {
      getEmployeesApi({ limit: 1000 }).then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setAllEmployees(res.data.data.employees || []);
        }
      });
    });
  }, []);


  useEffect(() => {
    fetchTeam();
  }, [project.id]);

  // ── Filter locally by search ──────────────────────────────────────────────
const filtered = members.filter((m) => {
  const matchesSearch = search.trim()
    ? m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
    : true;

  const matchesEmployee = selectedEmployee
    ? m._id === selectedEmployee   
    : true;

  return matchesSearch && matchesEmployee;
});

  // ── Table row shape ───────────────────────────────────────────────────────
  const tableData = filtered.map((m) => ({
    id:        m._id,
    name:      m.name,
    avatar:    m.avatar,
    role:      m.role,
    assigned:  m.assigned,
    completed: m.completed,
  }));

  // ── Delete ────────────────────────────────────────────────────────────────
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
            setMembers((prev) => prev.filter((m) => m._id !== row.id));
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

      <Box mb={2}>
        <Filter
        mode="team"
        employees={allEmployees}
        onFilterChange={(f) => {
          setSearch(f.search || "");
          setSelectedEmployee(f.employee || "");  
        }}
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

      <ConfirmationDialog ref={confirmDialogRef} />

      <SuccessPopup
        open={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Team member removed successfully."
        autoClose
        autoCloseDelay={2000}
      />
    </Box>
  );
};

export default TeamTab;