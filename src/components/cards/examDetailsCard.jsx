import React from "react";
import { Box, Typography } from "@mui/material";
import { FileText, User, Clock, Calendar, Link2 } from "lucide-react";
import ActionsButtons from "../dynamicTable/actionsButtons";

const EXAM_TYPE_COLORS = {
  "Weekly Test": { bg: "#04C3731A", color: "#04C373" },
  "Class Test": { bg: "#DCFCE7", color: "#166534" },
  "Mock Monthly Exam 1": { bg: "#FFEDD5", color: "#9A3412" },
  "Mock Monthly Exam 2": { bg: "#FFEDD5", color: "#9A3412" },
  "Practice Test": { bg: "#E5E7EB", color: "#374151" },
  // ✅ API se aane wali values
  "DAE": { bg: "#DBEAFE", color: "#1E40AF" },
};

const STATUS_COLORS = {
  Completed: { bg: "background.cardLight", color: "#000000" },
  Scheduled: { bg: "#F97316", color: "#fff" },
  Draft: { bg: "#0000001A", color: "#000000" },
  Active: { bg: "#22C55E", color: "#fff" },
  Cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  draft: { bg: "#F3F4F6", color: "#6B7280" },
  scheduled: { bg: "#F97316", color: "#fff" },
  active: { bg: "#22C55E", color: "#fff" },
  completed: { bg: "#F3F4F6", color: "#6B7280" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

const formatLabel = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const ExamDetailsCard = ({
  title = "",
  description = "",
  examType = "",
  status = "",
  subject = "",
  marks = "",
  duration = "",
  date = "",
  questionPaper = "",
  createdBy = "",
  campus = "",
  batch = "",
  linkedToGrading = false,
  row = null,
  onEdit,
  onDelete,
  onStartExam,
  onSchedule,
  onCancel,
  onMarksComplete,
  sx = {},
}) => {
  const examRow = row || {
    title, description, examType, status, subject,
    marks, duration, date, questionPaper,
    createdBy, campus, batch, linkedToGrading,
  };

  const displayExamType = formatLabel(examType || "");
  const displayStatus = formatLabel(status || "");
  const examTypeStyle = EXAM_TYPE_COLORS[displayExamType] || EXAM_TYPE_COLORS[examType] || { bg: "#E5E7EB", color: "#374151" };
  const statusStyle = STATUS_COLORS[displayStatus] || STATUS_COLORS[status] || { bg: "#F3F4F6", color: "#6B7280" };

  const statusLower = (status || "").toLowerCase();
  const showEditDelete = ["draft", "completed", "scheduled", "active", "cancelled"].includes(statusLower);
  const showStartExam = statusLower === "scheduled";
  const showSchedule = statusLower === "draft";
  const showCancel = statusLower === "draft" || statusLower === "scheduled";
  const showMarksComplete = statusLower === "active";
  const hasAnyAction = showEditDelete || showStartExam || showSchedule || showCancel || showMarksComplete;
  const showEditDeleteFallback = !hasAnyAction && (!!onEdit || !!onDelete);

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        p: 2.5,
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #E0E0E0",
        },
        ...sx,
      }}
    >
      {/* Header: Tags + 3-dot Action */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1.5}>
        <Box display="flex" flexWrap="wrap" gap={1} flex={1}>
          {displayExamType && (
            <Box
              sx={{
                bgcolor: examTypeStyle.bg,
                color: examTypeStyle.color,
                px: 1.5,
                py: 0.25,
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {displayExamType}
            </Box>
          )}
          {displayStatus && (
            <Box
              sx={{
                bgcolor: statusStyle.bg,
                color: statusStyle.color,
                px: 1.5,
                py: 0.25,
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {displayStatus}
            </Box>
          )}
          {linkedToGrading && (
            <Box
              sx={{
                bgcolor: "#F3F4F6",
                color: "#6B7280",
                px: 1.5,
                py: 0.25,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Link2 size={12} />
              Linked to Grading
            </Box>
          )}
        </Box>
        <ActionsButtons
          row={examRow}
          onEdit={(showEditDelete || showEditDeleteFallback) && !!onEdit}
          onEditClick={(r) => onEdit?.(r)}
          onDelete={(showEditDelete || showEditDeleteFallback) && !!onDelete}
          onDeleteClick={(r) => onDelete?.(r)}
          onStartExam={showStartExam && !!onStartExam}
          onStartExamClick={(r) => onStartExam?.(r)}
          onSchedule={showSchedule && !!onSchedule}
          onScheduleClick={(r) => onSchedule?.(r)}
          onCancel={showCancel && !!onCancel}
          onCancelClick={(r) => onCancel?.(r)}
          onMarksComplete={showMarksComplete && !!onMarksComplete}
          onMarksCompleteClick={(r) => onMarksComplete?.(r)}
        />
      </Box>

      {/* Title */}
      <Box display="flex" gap={1}>
        <Box>
          {/* <Typography
            fontSize="18px"
            fontWeight={600}
            color="#111827"
            mb={0.5}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </Typography> */}
        </Box>
        {/* {displayExamType && (
          <Box
            sx={{
              bgcolor: examTypeStyle.bg,
              color: examTypeStyle.color,
              px: 1.5,
              py: 0.25,
              borderRadius: "50px",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {displayExamType}
          </Box>
        )} */}
      </Box>

      <Typography
        fontSize="18px"
        fontWeight={600}
        color="#111827"
        mb={0.5}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography fontSize="14px" color="#6B7280" mb={1.5} sx={{ lineHeight: 1.5 }}>
          {description}
        </Typography>
      )}

      {/* Details Row */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={1.5}>
        {subject && (
          <Box display="flex" alignItems="center" gap={0.75}>
            <FileText size={16} color="#6B7280" />
            <Typography fontSize="13px" fontWeight={500} color="#374151">
              {subject}
            </Typography>
          </Box>
        )}
        {marks && (
          <Box display="flex" alignItems="center" gap={0.75}>
            <User size={16} color="#6B7280" />
            <Typography fontSize="13px" fontWeight={500} color="#374151">
              {marks} marks
            </Typography>
          </Box>
        )}
        {duration && (
          <Box display="flex" alignItems="center" gap={0.75}>
            <Clock size={16} color="#6B7280" />
            <Typography fontSize="13px" fontWeight={500} color="#374151">
              {duration} min
            </Typography>
          </Box>
        )}
        {date && (
          <Box display="flex" alignItems="center" gap={0.75}>
            <Calendar size={16} color="#6B7280" />
            <Typography fontSize="13px" fontWeight={500} color="#374151">
              {date}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Question Paper */}
      {questionPaper && (
        <Typography fontSize="13px" color="#6B7280" mb={1.5}>
          Question Paper: {questionPaper}
        </Typography>
      )}

      {/* Creator Info */}
      {(createdBy || campus || batch) && (
        <Box sx={{ pt: 1.5, borderTop: "1px solid #E5E7EB" }}>
          <Typography fontSize="12px" color="#6B7280">
            {createdBy && `Created by ${createdBy}`}
            {campus && ` • ${campus}`}
            {batch && ` • Batch ${batch}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExamDetailsCard;