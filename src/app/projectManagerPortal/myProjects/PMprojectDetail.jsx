import { useState, useEffect }         from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import CustomTabs          from "../../../components/tabs";
import ProjectDetailHeader from "../../admin/projects/projectDetailHeader";
import OverviewTab         from "../../admin/projects/projectDetailTabs/overviewTab";
import ModulesTab          from "../../admin/projects/projectDetailTabs/modulesTab";
import TasksTab            from "../../admin/projects/projectDetailTabs/tasksTab";
import PipelineTab         from "../../admin/projects/projectDetailTabs/pipelineTab";
import TeamTab             from "../../admin/projects/projectDetailTabs/teamTab";
import PerformanceTab      from "../../admin/projects/projectDetailTabs/performanceTabs";
import DocumentsTab        from "../../admin/projects/projectDetailTabs/documentsTab";

import { getProjectByIdApi } from "../../../api/modules/project";

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

const PMprojectDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProjectId } = useParams();

  const [project,     setProject]     = useState(location.state?.project || {});
  const [activeTab,   setActiveTab]   = useState(1);
  const [stages,      setStages]      = useState(DEFAULT_STAGES);
  const [teamMembers, setTeamMembers] = useState([]);

  // ── Fetch full project to get saved stages (and, when navigated without
  // state — e.g. from a notification — backfill the rest of the project
  // fields too, so Team/Tasks/etc tabs get a real project.id to work with) ──
  useEffect(() => {
    const projectId = location.state?.project?.id || routeProjectId;
    if (!projectId) return;

    getProjectByIdApi(projectId).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const full = res.data.data.project;
        if (full.stages?.length) setStages(full.stages);

        // Only backfill when navigation state didn't already give us the
        // project — avoids clobbering anything already populated correctly.
        if (!location.state?.project) {
          setProject({
            id:               full._id,
            projectName:      full.projectName,
            client:           full.clientName || "—",
            description:      full.description || "",
            status: full.status
              ? full.status.charAt(0).toUpperCase() + full.status.slice(1)
              : "—",
            progress:         full.progress ?? 0,
            startDate: full.startDate
              ? new Date(full.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—",
            endDate: full.endDate
              ? new Date(full.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—",
            budget:           full.budget ?? 0,
            totalTasks:       full.totalTasks     ?? 0,
            completedTasks:   full.completedTasks ?? 0,
            projectManager:   full.projectManager?.fullName || "—",
            projectManagerId: full.projectManager?._id      || "",
            projectType:      full.projectType?.value || full.projectType?._id || "",
            projectTypeId:    full.projectType?._id        || "",
          });
        }
      }
    });
  }, []);

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

      {/* ── No onEditClick passed → header hides Edit button ─────────────── */}
     <ProjectDetailHeader project={project} role="pm" />

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 1 && <OverviewTab project={project} role="pm" />}
      {activeTab === 2 && (
        <TeamTab
          project={project}
          onTeamChange={setTeamMembers}
          role="pm"            
        />
      )}
      {activeTab === 3 && <ModulesTab     project={project} role="pm" />}
      {activeTab === 4 && (
        <PipelineTab
          project={project}
          stages={stages}
          onStagesChange={setStages}
        />
      )}
      {activeTab === 5 && (
        <TasksTab
          project={project}
          role="pm"
          stages={stages}
          teamMembers={teamMembers}
        />
      )}
      {activeTab === 6 && <PerformanceTab project={project} />}
      {activeTab === 7 && <DocumentsTab   project={project} />}
    </>
  );
};

export default PMprojectDetail;