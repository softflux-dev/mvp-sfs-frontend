import { useState } from "react";
import { Box, IconButton, Typography, Chip, Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import PaginatedTable      from "../../../components/dynamicTable";
import CommentsActivityFeed from "./commentsActivityFeed";
import EditIntegration     from "./editIntegration";
import SuccessPopup        from "../../../components/popups/confirmationDialog";

import backIcon from "../../../assets/icons/downlaod-back-btn.svg";

// ── Mock comments ──────────────────────────────────────────────────────────
const mockComments = [
  { id: 1, title: "Remove Expired Coolpad Download Url (#116)", author: "Sara Ali", avatar: "", date: "Jan 15, 2025 at 2:30 PM" },
  { id: 2, title: "Remove Expired Coolpad Download Url (#116)", author: "Sara Ali", avatar: "", date: "Jan 15, 2025 at 2:30 PM" },
  { id: 3, title: "Remove Expired Coolpad Download Url (#116)", author: "Sara Ali", avatar: "", date: "Jan 15, 2025 at 2:30 PM" },
  { id: 4, title: "Remove Expired Coolpad Download Url (#116)", author: "Sara Ali", avatar: "", date: "Jan 15, 2025 at 2:30 PM" },
];

// ── Mock commits ───────────────────────────────────────────────────────────
const mockCommits = [
  { id: 1, commitHash: "a1b2c3d", message: "feat: add new dashboard widgets",  branch: "Main", author: "Sarah Chen",    date: "Oct 1, 2025", linkedTask: "TASK-1234", isLinked: true  },
  { id: 2, commitHash: "e4f5g6h", message: "fix: resolve memory leak in worker",branch: "Main", author: "Mike Johnson",  date: "Oct 1, 2025", linkedTask: null,        isLinked: false },
  { id: 3, commitHash: "i7j8k9l", message: "chore: update dependencies",        branch: "Main", author: "Alex Kim",      date: "Oct 1, 2025", linkedTask: "TASK-1234", isLinked: true  },
  { id: 4, commitHash: "m0n1o2p", message: "feat: implement OAuth2 flow",        branch: "Main", author: "Sarah Chen",    date: "Oct 1, 2025", linkedTask: "TASK-1234", isLinked: true  },
];

const tableHeader = [
  { id: "commitHash", label: "Commit Hash" },
  { id: "message",    label: "Message"     },
  { id: "branch",     label: "Branch"      },
  { id: "author",     label: "Author"      },
  { id: "date",       label: "Date"        },
  { id: "linkedTask", label: "Linked Task" },
];

const displayRows = [
  "commit_hash",
  "commit_message",
  "commit_branch",
  "commit_author",
  "commit_date",
  "commit_linked_task",
];

const IntegrationDetail = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const row       = location.state?.integration || {};

  const [editOpen,    setEditOpen]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isConnected = row.status === "Connected";

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
          Back to Code Repository Integration
        </Typography>
      </Box>

      {/* ── Title + status ───────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Typography fontSize="22px" fontWeight={700} color="text.primary">
          {row.projectName || "Frontend Web App"}
        </Typography>
        <Chip
          label={row.status || "Connected"}
          sx={{
            height: "26px", fontSize: "12px", fontWeight: 500,
            px: 1, borderRadius: "12px",
            backgroundColor: isConnected ? "#04C3731A" : "#F5F5F5",
            color:           isConnected ? "#04C373"   : "#9E9E9E",
          }}
        />
      </Box>

      {/* ── Meta card ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "14px",
          px: 3, py: 2,
          mb: 4,
          mt:2
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
              Project Name
            </Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {row.projectName || "Frontend Web App"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
              Created Date & Time
            </Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              Jan 15, 2025 at 2:30 PM
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
              Repository Name
            </Typography>
            <Typography fontSize="14px" fontWeight={700} color="text.primary">
              {row.provider || "Get hub"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ── Comments Activity Feed ────────────────────────────────────────── */}
      <Box mb={3}>
        <CommentsActivityFeed comments={mockComments} />
      </Box>

      {/* ── Commit Table ─────────────────────────────────────────────────── */}
      <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={2}>
        Commit Table
      </Typography>

      <Box sx={{ backgroundColor: "#fff", borderRadius: "25px", p: 1 }}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={mockCommits}
          displayRows={displayRows}
          isLoading={false}
        />
      </Box>

      {/* ── Edit Integration ─────────────────────────────────────────────── */}
      <EditIntegration
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => { console.log("Saved:", data); setSaveSuccess(true); }}
        editingRow={row}
      />

      <SuccessPopup
        open={saveSuccess}
        onClose={() => setSaveSuccess(false)}
        message="Successfully Save"
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default IntegrationDetail;