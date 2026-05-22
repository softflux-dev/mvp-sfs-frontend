import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import CustomTabs          from "../../../components/tabs";
import ProjectDetailHeader from "./projectDetailHeader";

// ── Import directly from admin tabs — no duplication needed ──────────────────
import OverviewTab    from "../../admin/projects/projectDetailTabs/overviewTab";
import ModulesTab     from "../../admin/projects/projectDetailTabs/modulesTab";
import TasksTab       from "../../admin/projects/projectDetailTabs/tasksTab";
import PipelineTab    from "../../admin/projects/projectDetailTabs/pipelineTab";
import TeamTab        from "../../admin/projects/projectDetailTabs/teamTab";
import PerformanceTab from "../../admin/projects/projectDetailTabs/performanceTabs";
import DocumentsTab   from "../../admin/projects/projectDetailTabs/documentsTab";

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

const PMprojectDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project  = location.state?.project || {};

  const [activeTab, setActiveTab] = useState(1);

  return (
    <>
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

      {/* PM header — no Edit Project button */}
      <ProjectDetailHeader project={project} />

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Pass role="pm" so TasksTab uses correct navigate route */}
      {activeTab === 1 && <OverviewTab    project={project} role="pm" />}
      {activeTab === 2 && <ModulesTab     project={project} role="pm" />}
      {activeTab === 3 && <TasksTab       project={project} role="pm" />}
      {activeTab === 4 && <PipelineTab    project={project} role="pm" />}
      {activeTab === 5 && <TeamTab        project={project} role="pm" />}
      {activeTab === 6 && <PerformanceTab project={project} role="pm" />}
      {activeTab === 7 && <DocumentsTab   project={project} role="pm" />}
    </>
  );
};

export default PMprojectDetail;