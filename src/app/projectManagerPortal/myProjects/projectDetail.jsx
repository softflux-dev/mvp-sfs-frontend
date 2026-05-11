import { useState } from "react";
import { Box, IconButton, Grid, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import CustomTabs          from "../../../components/tabs";

import ProjectDetailHeader from "./projectDetailHeader";
import OverviewTab         from "./projectDetailTabs/overviewTab";
import ModulesTab          from "./projectDetailTabs/modulesTab";
import TasksTab            from "./projectDetailTabs/tasksTab";
import PipelineTab         from "./projectDetailTabs/pipelineTab";
import TeamTab             from "./projectDetailTabs/teamTab";
import PerformanceTab from "./projectDetailTabs/performanceTabs";
import DocumentsTab        from "./projectDetailTabs/documentsTab";


import backIcon     from "../../../assets/icons/downlaod-back-btn.svg";


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
  const [editOpen,  setEditOpen]  = useState(false);

 

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

      {/* ── Header card (title + meta) ────────────────────────────────────── */}
      <ProjectDetailHeader
        project={project}
        onEditClick={() => setEditOpen(true)}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

     

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === 1 && <OverviewTab project={project} />}
      {activeTab === 2 && <ModulesTab project={project} />}
      {activeTab === 3 && <TasksTab project={project} />}
      {activeTab === 4 && <PipelineTab project={project} />}
      {activeTab === 5 && <TeamTab project={project} />}
      {activeTab === 6 && <PerformanceTab project={project} />}
      {activeTab === 7 && <DocumentsTab project={project} />}
      {/* ── Edit Project dialog ──────────────────────────────────────────── */}
     
    </>
  );
};

export default PMprojectDetail;