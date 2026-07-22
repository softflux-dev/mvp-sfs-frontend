import { useState, useEffect }         from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation, useParams, useSearchParams }    from "react-router-dom";

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
import { getProjectManagersApi, getProjectByIdApi } from "../../../api/modules/project";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

const DEFAULT_STAGES = [
  { id: "stage_1", label: "Stage 1" },
  { id: "stage_2", label: "Stage 2" },
  { id: "stage_3", label: "Stage 3" },
  { id: "stage_4", label: "Stage 4" },
  { id: "stage_5", label: "Stage 5" },
];

const tabs = [
  { id: 1, label: "Overview"    },
  { id: 2, label: "Team"        },
  { id: 3, label: "Modules"     },
  { id: 4, label: "Pipeline"    },
  { id: 5, label: "Tasks"       },
  { id: 6, label: "Performance" },
  { id: 7, label: "Documents"   },
];

const ProjectDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();


  const initialTab = parseInt(searchParams.get("tab"), 10) || 1;
  const [project,     setProject]     = useState(location.state?.project || {});
  const [activeTab,   setActiveTab]   = useState(initialTab);
  const [editOpen,    setEditOpen]    = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError,    setApiError]    = useState("");
  const [managers,    setManagers]    = useState([]);

  // ── Stages + team — shared across Pipeline + Tasks tabs ──────────────────
  const [stages,      setStages]      = useState(DEFAULT_STAGES);
  const [teamMembers, setTeamMembers] = useState([]);

  const { updateProject, actionLoading } = useProject();
  const { projectTypes, fetchProjectTypes } = useProjectType();

   const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: String(newTab) }, { replace: true });
  };

  // ── Fetch full project on mount to get saved stages ───────────────────────
 useEffect(() => {
    fetchProjectTypes();
    getProjectManagersApi().then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        setManagers(res.data.data.managers || []);
      }
    });

   

    // fetch full project to get saved stages (and, when navigated without
    // state — e.g. from a notification — the rest of the project fields too)
    const projectId = location.state?.project?.id || routeProjectId;
    if (!projectId) return;

    getProjectByIdApi(projectId).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const fullProject = res.data.data.project;
        if (fullProject.stages?.length) {
          setStages(fullProject.stages);
        }

        // ── Only backfill `project` state when we didn't already get it
        //    from navigation state — avoids clobbering anything the
        //    existing flow already populated correctly. ──────────────────
        if (!location.state?.project) {
          setProject({
            id:               fullProject._id,
            projectName:      fullProject.projectName,
            client:           fullProject.clientName || "—",
            description:      fullProject.description || "",
            status: fullProject.status
              ? fullProject.status.charAt(0).toUpperCase() + fullProject.status.slice(1)
              : "—",
            progress:         fullProject.progress ?? 0,
            startDate: fullProject.startDate
              ? new Date(fullProject.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—",
            endDate: fullProject.endDate
              ? new Date(fullProject.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—",
            budget:           fullProject.budget ?? 0,
            projectManager:   fullProject.projectManager?.fullName || "—",
            projectManagerId: fullProject.projectManager?._id      || "",
            projectType:      fullProject.projectType?.value || fullProject.projectType?._id || "",
            projectTypeId:    fullProject.projectType?._id        || "",
          });
        }
      }
    });
  }, []);

  const handleSave = async (formData) => {
    const payload = {
      projectName:    formData.projectName,
      clientName:     formData.clientName,
      description:    formData.description    || "",
      projectManager: formData.projectManager || null,
      projectType:    formData.projectType    || null,
      startDate:      formData.startDate      || null,
      endDate:        formData.endDate        || null,
      status:         formData.status         || "new",
      budget:         formData.budget ? Number(formData.budget) : 0,
    };

    const result = await updateProject(project.id, payload);

   if (result.success) {
      const selectedManager = managers.find((m) => m._id === payload.projectManager);
      setProject((prev) => ({
        ...prev,
        projectName:      payload.projectName,
        client:           payload.clientName,
        description:      payload.description,
        startDate:        payload.startDate
          ? new Date(payload.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : prev.startDate,
        endDate:          payload.endDate
          ? new Date(payload.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : prev.endDate,
        status:           payload.status
          ? payload.status.charAt(0).toUpperCase() + payload.status.slice(1)
          : prev.status,
        budget:           payload.budget ?? prev.budget,
        projectManager:   selectedManager?.fullName || prev.projectManager,
        projectManagerId: payload.projectManager || prev.projectManagerId,
        projectTypeId:    payload.projectType    || prev.projectTypeId,
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
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} disableRipple>
          <img src={backIcon} alt="back" style={{ width: 40, height: 40 }} />
        </IconButton>
        <Typography
          fontSize="14px" fontWeight={500} color="text.secondary"
          sx={{ cursor: "pointer" }} onClick={() => navigate(-1)}
        >
          Back to Projects
        </Typography>
      </Box>

      <ProjectDetailHeader project={project} onEditClick={() => setEditOpen(true)} />

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 1 && <OverviewTab    project={project} />}
      {activeTab === 2 && (
        <TeamTab
          project={project}
          onTeamChange={setTeamMembers}
        />
      )}
      {activeTab === 3 && <ModulesTab     project={project} />}
      {activeTab === 4 && (
        <PipelineTab project={project} stages={stages} onStagesChange={setStages} role="pm" />
      )}
      {activeTab === 5 && (
        <TasksTab
          project={project}
          stages={stages}
          teamMembers={teamMembers}
        />
      )}
      {activeTab === 6 && <PerformanceTab project={project} />}
      {activeTab === 7 && (
        <DocumentsTab
          project={project}
          teamMembers={teamMembers}
          projectManager={
            managers.find((m) => m._id === project.projectManagerId) || null
          }
        />
      )}

      <AddProject
        open={editOpen}
        onClose={() => { setEditOpen(false); setApiError(""); }}
        onSave={handleSave}
        editingProject={project}
        loading={actionLoading}
        apiError={apiError}
        projectTypeOptions={projectTypes}
        managerOptions={managers}
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