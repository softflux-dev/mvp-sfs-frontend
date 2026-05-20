import { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import CustomTabs          from "../../../components/tabs";
import AddProject          from "./addProject";
import ProjectDetailHeader from "./projectDetailHeader";
import OverviewTab         from "./projectDetailTabs/overviewTab";
import ModulesTab          from "./projectDetailTabs/modulesTab";
import TasksTab            from "./projectDetailTabs/tasksTab";
import PipelineTab         from "./projectDetailTabs/pipelineTab";
import TeamTab             from "./projectDetailTabs/teamTab";
import PerformanceTab      from "./projectDetailTabs/performanceTabs";
import DocumentsTab        from "./projectDetailTabs/documentsTab";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

import { useProject }            from "../../../hooks/project";
import { useProjectType }        from "../../../hooks/projectType";
import { useDepartment }         from "../../../hooks/department";
import { getProjectManagersApi } from "../../../api/modules/project";
import { getEmployeesApi }       from "../../../api/modules/employee";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

const tabs = [
  { id: 1, label: "Overview"    },
  { id: 2, label: "Modules"     },
  { id: 3, label: "Tasks"       },
  { id: 4, label: "Pipeline"    },
  { id: 5, label: "Team"        },
  { id: 6, label: "Performance" },
  { id: 7, label: "Documents"   },
];

const ProjectDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // project passed via navigation state
  const [project, setProject] = useState(location.state?.project || {});

  const [activeTab,   setActiveTab]   = useState(1);
  const [editOpen,    setEditOpen]    = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");

  // ── Dropdown data (same as Projects page) ────────────────────────────────
  const [managers,  setManagers]  = useState([]);
  const [employees, setEmployees] = useState([]);

  const { updateProject, actionLoading } = useProject();
  const { projectTypes, fetchProjectTypes } = useProjectType();
  const { departments,  fetchDepartments  } = useDepartment();

  useEffect(() => {
    fetchDepartments({ limit: 100 });
    fetchProjectTypes();

    getProjectManagersApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setManagers(res.data.data.managers || []);
      }
    });

    getEmployeesApi({ limit: 100 }).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setEmployees(res.data.data.employees || []);
      }
    });
  }, []);

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    const payload = {
      projectName:    formData.projectName,
      clientName:     formData.clientName,
      description:    formData.description    || "",
      projectManager: formData.projectManager || null,
      projectType:    formData.projectType    || null,
      departments:    formData.departmentIds  || [],
      assignees:      formData.assigneeIds    || [],
      startDate:      formData.startDate      || null,
      endDate:        formData.endDate        || null,
      status:         formData.status         || "planning",
      budget:         formData.budget ? Number(formData.budget) : 0,
    };

    const result = await updateProject(project.id, payload);

    if (result.success) {
      // ── Update local project state so header reflects changes immediately
      setProject((prev) => ({
        ...prev,
        projectName:    payload.projectName,
        client:         payload.clientName,
        description:    payload.description,
        startDate:      payload.startDate
          ? new Date(payload.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : prev.startDate,
        endDate:        payload.endDate
          ? new Date(payload.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : prev.endDate,
        status:         payload.status
          ? payload.status.charAt(0).toUpperCase() + payload.status.slice(1)
          : prev.status,
        budget:         payload.budget ?? prev.budget,
        projectManagerId: payload.projectManager || prev.projectManagerId,
        projectTypeId:    payload.projectType    || prev.projectTypeId,
        departmentIds:    payload.departments    || prev.departmentIds,
        assigneeIds:      payload.assignees      || prev.assigneeIds,
      }));

      setSuccessMsg(result.message);
      setShowSuccess(true);
      setEditOpen(false);
      setApiError("");
    } else {
      setApiError(result.message);
    }
  };

  return (
    <>
      {/* ── Back button ──────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography
          fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          Back to Projects
        </Typography>
      </Box>

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <ProjectDetailHeader
        project={project}
        onEditClick={() => setEditOpen(true)}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === 1 && <OverviewTab    project={project} />}
      {activeTab === 2 && <ModulesTab     project={project} />}
      {activeTab === 3 && <TasksTab       project={project} />}
      {activeTab === 4 && <PipelineTab    project={project} />}
      {activeTab === 5 && <TeamTab        project={project} />}
      {activeTab === 6 && <PerformanceTab project={project} />}
      {activeTab === 7 && <DocumentsTab   project={project} />}

      {/* ── Edit Project dialog — fully wired ────────────────────────────── */}
      <AddProject
        open={editOpen}
        onClose={() => { setEditOpen(false); setApiError(""); }}
        onSave={handleSave}
        editingProject={project}
        loading={actionLoading}
        apiError={apiError}
        projectTypeOptions={projectTypes}    
        managerOptions={managers}            
        departmentOptions={departments}      
        employeeOptions={employees}        
      />

      <SuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default ProjectDetail;