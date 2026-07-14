// employees/employeeDetailTabs/assignedProjectsTab.jsx
import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PaginatedTable  from "../../../../components/dynamicTable";
import { getProjectsApi } from "../../../../api/modules/project";
import ViewIcon from "../../../../assets/icons/view.svg";

const tableHeader = [
  { id: "projectName", label: "Project Name" },
  { id: "client",       label: "Client"       },
  { id: "status",       label: "Status"       },
  { id: "progress",     label: "Progress"     },
  { id: "team",         label: "Team Size"    },
  { id: "startDate",    label: "Start Date"   },
  { id: "endDate",      label: "End Date"     },
  { id: "actions",      label: "Actions"      },
];

const displayRows = [
  "projectName",
  "client",
  "project_status",
  "progress",
  "team",
  "startDate",
  "endDate",
  "perf_view",
];

const AssignedProjectsTab = ({ employee = {} }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const pmId = employee.id || employee._id;
    if (!pmId) return;

    setLoading(true);
    setError("");
    getProjectsApi({ manager: pmId, limit: 100 })
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          setProjects(res.data.data.projects || []);
        } else {
          setError(res?.data?.message || "Failed to fetch assigned projects.");
        }
      })
      .catch(() => setError("Something went wrong."))
      .finally(() => setLoading(false));
  }, [employee.id, employee._id]);

  const tableData = projects.map((p) => ({
  id:          p._id,
  projectName: p.projectName,
  client:      p.clientName || "—",
  status:      p.status
    ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
    : "New",
  progress:    `${p.progress ?? 0}%`,
  team:        (p.assignees || []).length,
  startDate:   p.startDate
    ? new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—",
  endDate:     p.endDate
    ? new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—",
  projectManager: p.projectManager?.fullName || "—",
  budget:         p.budget ?? 0,
  projectType:    p.projectType?.value || p.projectType?._id || "",
  projectTypeId:  p.projectType?._id || "",
  projectManagerId: p.projectManager?._id || "",
}));

  return (
    <Box sx={{ mt: 2, bgcolor: "#fff", borderRadius: "16px", p: 2 }}>
      {error && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      ) : tableData.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <Typography fontSize={14} color="text.secondary">
            No projects assigned to this employee as Project Manager yet.
          </Typography>
        </Box>
      ) : (
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          isLoading={loading}
          viewIcon={ViewIcon}
        onViewClick={(row) =>
        navigate(`/projects/${row.id}`, {
            state: {
            project: {
                id:               row.id,
                projectName:      row.projectName,
                client:           row.client,
                status:           row.status,
                progress:         parseInt(row.progress) || 0,
                startDate:        row.startDate,
                endDate:          row.endDate,
                projectManager:   row.projectManager,
                 projectManagerId: row.projectManagerId,
                budget:           row.budget,
                projectType:      row.projectType,
                projectTypeId:    row.projectTypeId,
            },
            },
        })
        }
        />
      )}
    </Box>
  );
};

export default AssignedProjectsTab;