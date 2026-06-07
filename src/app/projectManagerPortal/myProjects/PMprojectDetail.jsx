import { useState, useEffect }         from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation }    from "react-router-dom";

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

  const [project,     setProject]     = useState(location.state?.project || {});
  const [activeTab,   setActiveTab]   = useState(1);
  const [stages,      setStages]      = useState(DEFAULT_STAGES);
  const [teamMembers, setTeamMembers] = useState([]);

  // ── Fetch full project to get saved stages ────────────────────────────────
  useEffect(() => {
    const projectId = location.state?.project?.id;
    if (!projectId) return;
    getProjectByIdApi(projectId).then((res) => {
      if (res?.status === 200 || res?.status === 201) {
        const full = res.data.data.project;
        if (full.stages?.length) setStages(full.stages);
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
          role="pm"             // ← PM: no Add Member button shown
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