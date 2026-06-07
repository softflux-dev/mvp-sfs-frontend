import {
  Box,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import {Button} from "@mui/material";
import TableSkeleton from "../skeleton/TableSkeleton";
import { MoreVerticalIcon } from "lucide-react";
import { Link } from "lucide-react";
import CustomButton from "../customButton";
import download from "../../assets/icons/download.svg";
import viewIcon from "../../assets/icons/view.svg";
import Delete from "../../assets/icons/delete-icon-inactive.svg";
import Edit from "../../assets/icons/editIcon.svg"
import ProgressBar from "../progressBar";

const STATUS_CONFIG = {
  Active:        { bg: "#D1FAE5", color: "#059669" },
  Completed:     { bg: "#D1FAE5", color: "#059669" },   
  Approved:      { bg: "#D1FAE5", color: "#059669" },
  Planning:      { bg: "#E9D5FF", color: "#7C3AED" },
  Pending:       { bg: "#FEF3C7", color: "#D97706" },
  "In Progress": { bg: "#FEF3C7", color: "#D97706" },   
  Development:   { bg: "#DBEAFE", color: "#2563EB" },
  Testing:       { bg: "#E0E7FF", color: "#4F46E5" },
  Review:        { bg: "#FEF9C3", color: "#CA8A04" },
  Inactive:      { bg: "#FECACA", color: "#DC2626" },
  Rejected:      { bg: "#FECACA", color: "#DC2626" },
  Overdue:       { bg: "#FECACA", color: "#DC2626" },
   "New":         { bg: "#E9D5FF", color: "#7C3AED" },
  "In Progress": { bg: "#FEF3C7", color: "#D97706" },
  "Paused":      { bg: "#FEF9C3", color: "#CA8A04" },
};

// ── Priority color map ────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High:   { bg: "#FECACA", color: "#DC2626" },   // red   
  Medium: { bg: "#FEF3C7", color: "#D97706" },   // amber
  Low:    { bg: "#DBEAFE", color: "#2563EB" },   // blue
};

 const ATTENDANCE_STATUS_CONFIG = {
   Present: { bg: "#04C3731A", color: "#04C373" },
   Absent:  { bg: "#FF00001A", color: "#FF0000" },
   Late:    { bg: "#F973161A", color: "#F97316" },
   Leave:   { bg: "#2B6EFF1A", color: "#2B6EFF" },
   Holiday: { bg: "#AA24931A", color: "#AA2493" },
   Weekend: { bg: "#F5F5F5",   color: "#9CA3AF" },
 };
function TaskAssigneesCell({ row }) {
  const [showAll, setShowAll] = useState(false);

  const names   = Array.isArray(row.assigneeNames) ? row.assigneeNames : [];
  const visible  = names.slice(0, 2);
  const overflow = names.slice(2);

  if (!names.length) {
    return (
      <TableCell>
        <Typography fontSize="13px" color="text.secondary">—</Typography>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
        {visible.map((name, i) => (
          <Box key={i} sx={{ px: "8px", py: "3px", borderRadius: "6px", backgroundColor: "#F0F0F0", fontSize: "12px", fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>
            {name}
          </Box>
        ))}
        {!showAll && overflow.length > 0 && (
          <Box onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
            sx={{ px: "8px", py: "3px", borderRadius: "6px", backgroundColor: "#AA24931A", fontSize: "12px", fontWeight: 600, color: "#AA2493", cursor: "pointer", whiteSpace: "nowrap", "&:hover": { backgroundColor: "#AA249330" } }}>
            +{overflow.length} more
          </Box>
        )}
        {showAll && overflow.map((name, i) => (
          <Box key={i} sx={{ px: "8px", py: "3px", borderRadius: "6px", backgroundColor: "#F0F0F0", fontSize: "12px", fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>
            {name}
          </Box>
        ))}
        {showAll && overflow.length > 0 && (
          <Box onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
            sx={{ px: "8px", py: "3px", borderRadius: "6px", backgroundColor: "#F5F5F5", fontSize: "12px", fontWeight: 600, color: "#9CA3AF", cursor: "pointer", "&:hover": { backgroundColor: "#E5E5E5" } }}>
            less
          </Box>
        )}
      </Box>
    </TableCell>
  );
}
 

export default function PaginatedTable({
  tableWidth,
  tableHeader,
  tableData,
  displayRows,
  isLoading,
  showPagination = true,
  hidepagination = false,
  headerBgColor = "primary.lightGray",
  serverSidePagination = false,
  totalCount = 0,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  getRowId = (row) => row.id || row._id || JSON.stringify(row),
  customRenderCell,
  viewIcon,
  editIcon: EditIcon,
  onEditClick,
  onViewClick,
  downloadIcon,
  onDownloadClick,
  onDeleteClick,
  deleteIcon: DeleteIcon,
  menuIcon,
  menuOptions,
  onMenuAction,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  projectTypes = [],
  onApproveClick,
  onRejectClick,
  stages = [],
}) {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const openMenu = Boolean(anchorEl);

  const page = serverSidePagination ? externalPage ?? 0 : internalPage;
  const rowsPerPage = serverSidePagination ? externalRowsPerPage ?? 10 : internalRowsPerPage;

  const columnKeys = useMemo(
    () => (Array.isArray(displayRows) ? displayRows : []),
    [displayRows]
  );

  const handleChangePage = (event, newPage) => {
    serverSidePagination && onPageChange
      ? onPageChange(event, newPage)
      : setInternalPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    serverSidePagination && onRowsPerPageChange
      ? onRowsPerPageChange(event, value)
      : (setInternalRowsPerPage(value), setInternalPage(0));
  };

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleMenuItemClick = (action) => {
    if (onMenuAction && selectedRow) onMenuAction(action, selectedRow);
    handleMenuClose();
  };

  const renderCell = (row, val, index) => {
    if (customRenderCell) {
      const custom = customRenderCell(row, val, index);
      if (custom) return custom;
    }

    switch (val) {

      // ── Employee avatar + name + role ─────────────────────────────────────
      case "employee_details":
        return (
          <TableCell key={val}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Avatar src={row.image} alt={row.name || row.employee} sx={{ width: 40, height: 40 }} />
              <Stack>
                <Typography fontSize="12px" fontWeight={700} color="text.black">
                  {row.employee || row.name}
                </Typography>
                {row.role && (
                  <Typography fontSize="10px" color="text.secondary">
                    {row.role}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </TableCell>
        );

      // ── Task assignee — avatar + name ─────────────────────────────────────
  case "task_assignees":
  return <TaskAssigneesCell key={val} row={row} />;

      // ── Task priority chip ────────────────────────────────────────────────
      case "task_priority": {
        const pcfg = PRIORITY_CONFIG[row.priority] || { bg: "#F5F5F5", color: "#757575" };
        return (
          <TableCell key={val}>
            <Chip
              label={row.priority}
              sx={{
                height: "24px",
                fontSize: "12px",
                fontWeight: 500,
                px: 1,
                borderRadius: "12px",
                backgroundColor: pcfg.bg,
                color: pcfg.color,
              }}
            />
          </TableCell>
        );
      }

      case "task_start_date":
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={400} color="text.black">
              {row.startDate || "-"}
            </Typography>
          </TableCell>
        );
         case "task_end_date":
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={400} color="text.black">
              {row.endDate || "-"}
            </Typography>
          </TableCell>
        );

      // ── Status chip (generic + project) ──────────────────────────────────
      case "status_chip":
case "project_status": {
  const stageLabel = stages?.find((s) => s.id === row.status)?.label
    || row.status || "—";
  const cfg = STATUS_CONFIG[stageLabel] || { bg: "#EDE9F6", color: "#7C3AED" };
  return (
    <TableCell key={val}>
      <Chip
        label={stageLabel}
        sx={{
          height: "26px", fontSize: "12px", fontWeight: 500,
          px: 1.5, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

        case "task_status": {
        const cfg = STATUS_CONFIG[row.taskStatus] || { bg: "#F5F5F5", color: "#757575" };
        return (
          <TableCell key={val}>
            <Chip
              label={row.taskStatus}
              sx={{
                height: "26px",
                fontSize: "12px",
                fontWeight: 500,
                px: 1.5,
                borderRadius: "12px",
                backgroundColor: cfg.bg,
                color: cfg.color,
              }}
            />
          </TableCell>
        );
      }

      // ── Project progress bar ──────────────────────────────────────────────
     case "project_progress":
      return (
        <TableCell key={val}>
          <Box minWidth="150px">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography fontSize="11px" fontWeight={500} color="text.secondary">
                {row.completedTasks ?? 0}/{row.totalTasks ?? 0} tasks
              </Typography>
              <Typography fontSize="11px" fontWeight={600} color="text.primary">
                {row.progress ?? 0}%
              </Typography>
            </Box>
            <ProgressBar
              value={row.progress ?? 0}
              showPercentage={false}
              height={6}
            />
          </Box>
        </TableCell>
      );

      // ── Generic progress bar ──────────────────────────────────────────────
      case "progress_bar":
        return (
          <TableCell key={val}>
            <Box display="flex" alignItems="center" gap={1.5} sx={{ width: "160px" }}>
              <Box sx={{ width: "100px" }}>
                <ProgressBar value={row.progress ?? 0} showPercentage={false} height={6} sx={{ mb: 0 }} />
              </Box>
              <Typography fontSize="12px" fontWeight={500} color="text.secondary">
                {row.progress ?? 0}%
              </Typography>
            </Box>
          </TableCell>
        );

      // ── Three-dot menu ────────────────────────────────────────────────────
      case "actions_menu":
        return (
          <TableCell key={val}>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, row)}
              sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
            >
              <MoreVerticalIcon size={18} />
            </IconButton>
          </TableCell>
        );

      // ── Icon buttons: view / edit / download / delete ─────────────────────
      case "actions":
        return (
          <TableCell key={val}>
            <Box display="flex" alignItems="center" gap={0.5}>
              {viewIcon && (
                <IconButton size="small" sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }} onClick={() => onViewClick?.(row)}>
                  <img src={viewIcon} alt="view" style={{ width: 20, height: 20 }} />
                </IconButton>
              )}
              {EditIcon && (
                <IconButton size="small" sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }} onClick={() => onEditClick?.(row)}>
                  {React.isValidElement(EditIcon) ? EditIcon : React.createElement(EditIcon, { style: { width: 20, height: 20 } })}
                </IconButton>
              )}
              {downloadIcon && (
                <IconButton size="small" sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }} onClick={() => onDownloadClick?.(row)}>
                  <img src={download} alt="download" style={{ width: 20, height: 20 }} />
                </IconButton>
              )}
              {DeleteIcon && (
              <IconButton
                size="small"
                sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
                onClick={() => onDeleteClick?.(row)}
              >
                {React.isValidElement(DeleteIcon)
                  ? DeleteIcon
                  : typeof DeleteIcon === "string"
                    ? <img src={DeleteIcon} alt="delete" style={{ width: 20, height: 20 }} />
                    : React.createElement(DeleteIcon, { style: { width: 20, height: 20 } })}
              </IconButton>
            )}
            </Box>
          </TableCell>
        );

        // ── Team member — avatar + name ───────────────────────────────────────
        case "team_member":
          return (
            <TableCell key={val}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar
                  src={row.avatar}
                  alt={row.name}
                  sx={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {row.name?.charAt(0) || "A"}
                </Avatar>
                <Typography fontSize="13px" fontWeight={500} color="text.black">
                  {row.name}
                </Typography>
              </Stack>
            </TableCell>
          );

        case "perf_member":
        return (
          <TableCell key={val}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar
                src={row.avatar}
                alt={row.name}
                sx={{
                  width: 34,
                  height: 34,
                  background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {row.name?.charAt(0) || "A"}
              </Avatar>
              <Typography fontSize="13px" fontWeight={500} color="text.black">
                {row.name}
              </Typography>
            </Stack>
          </TableCell>
        );
 
      // ── Performance tab — assigned count ──────────────────────────────────
      case "perf_assigned":
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={500} color="text.black">
              {row.assigned ?? "-"}
            </Typography>
          </TableCell>
        );
 
      // ── Performance tab — completed count ─────────────────────────────────
      case "perf_completed":
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={500} color="text.black">
              {row.completed ?? "-"}
            </Typography>
          </TableCell>
        );
 
      // ── Performance tab — in progress count ───────────────────────────────
      case "perf_in_progress":
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={500} color="text.black">
              {row.inProgress ?? "-"}
            </Typography>
          </TableCell>
        );
 
      // ── Performance tab — delayed count ───────────────────────────────────
      case "perf_delayed":
        return (
          <TableCell key={val}>
            <Typography
              fontSize="13px"
              fontWeight={500}
              color={row.delayed > 0 ? "#FF0000" : "text.black"}
            >
              {row.delayed ?? "-"}
            </Typography>
          </TableCell>
        );
 
      // ── Performance tab — completion rate with mini progress bar ──────────
      case "perf_completion_rate":
        return (
          <TableCell key={val}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: "80px",
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: "#F0F0F0",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: `${row.completionRate ?? 0}%`,
                    height: "100%",
                    borderRadius: "3px",
                    background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
                  }}
                />
              </Box>
              <Typography fontSize="13px" fontWeight={600} color="text.black">
                {row.completionRate ?? 0}%
              </Typography>
            </Box>
          </TableCell>
        );


// ── Document name with file icon ──────────────────────────────────────────
case "doc_name":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Typography fontSize="13px" fontWeight={500} color="text.black">
          {row.fileName || "-"}
        </Typography>
      </Stack>
    </TableCell>
  );

// ── Document type chip ────────────────────────────────────────────────────
case "doc_type":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.type || "-"}
      </Typography>
    </TableCell>
  );

  case "imp_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.date || "-"}
      </Typography>
    </TableCell>
  );

case "imp_timestamp":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.timestamp || "-"}
      </Typography>
    </TableCell>
  );

case "imp_file_name":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px" fontWeight={500} color="text.primary"
        sx={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {row.fileName || "-"}
      </Typography>
    </TableCell>
  );

case "imp_file_size":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.fileSize || "-"}
      </Typography>
    </TableCell>
  );

case "imp_imported_by":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.importedBy || "-"}
      </Typography>
    </TableCell>
  );

case "imp_records":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.records ?? "-"}
      </Typography>
    </TableCell>
  );

case "imp_status": {
  const IMP_STATUS = {
    Success: { bg: "#04C3731A", color: "#04C373" },
    Failed:  { bg: "#FF00001A", color: "#FF0000" },
    Partial: { bg: "#FF972F1A", color: "#FF972F" },
  };
  const cfg = IMP_STATUS[row.status] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

case "imp_actions":
  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <IconButton
          size="small"
          onClick={() => onDownloadClick?.(row)}
          sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
        >
          <img src={download} alt="download" style={{ width: 20, height: 20 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDeleteClick?.(row)}
          sx={{ color: "#9CA3AF", "&:hover": { color: "#FF0000", backgroundColor: "#FF00001A" } }}
        >
          <img src={Delete} alt="delete" style={{ width: 20, height: 20 }} />
        </IconButton>
      </Box>
    </TableCell>
  );

// ── Document file size ────────────────────────────────────────────────────
case "doc_file_size":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.fileSize || "-"}
      </Typography>
    </TableCell>
  );

// ── Document uploaded by ──────────────────────────────────────────────────
case "doc_uploaded_by":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.uploadedBy || "-"}
      </Typography>
    </TableCell>
  );

  // ── Employee type chip (Full-time / Contract) ─────────────────────────────
case "emp_type": {
  
  const typeRaw = (row.type || "").toLowerCase().replace(/[-_\s]/g, "");
  const typeLabel =
    typeRaw === "fulltime"   ? "Full-time" :
    typeRaw === "contract"   ? "Contract"  :
    typeRaw === "parttime"   ? "Part-time" :
    row.type || "—";

  const typeCfg =
    typeLabel === "Full-time" ? { bg: "#04C3731A", color: "#04C373" } :
    typeLabel === "Contract"  ? { bg: "#AA24931A", color: "#AA2493" } :
    typeLabel === "Part-time" ? { bg: "#2B6EFF1A", color: "#2B6EFF" } :
                                { bg: "#F5F5F5",   color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={typeLabel}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: typeCfg.bg, color: typeCfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Employee role chip ────────────────────────────────────────────────────
case "emp_role": {
  // Normalize role label for display and color matching
  const roleRaw = (row.role || "").toLowerCase().replace(/\s+/g, " ").trim();
   const roleLabel = (row.role || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

  const roleCfg =
    roleLabel === "Junior Full Stack Developer"       ? { bg: "#04C3731A", color: "#04C373" } :
     roleLabel === "Frontend Developer" ? { bg: "#04C3731A", color: "#04C373" } :
    roleLabel === "Project Manager" ? { bg: "#2B6EFF1A", color: "#2B6EFF" } :
    roleLabel === "Designer"        ? { bg: "#AA24931A", color: "#AA2493" } :
    roleLabel === "QA Tester"       ? { bg: "#FF972F1A", color: "#FF972F" } :
    roleLabel === "HR Manager"      ? { bg: "#AA24931A", color: "#AA2493" } :
    roleLabel === "HR"      ? { bg: "#AA24931A", color: "#AA2493" } :
    roleLabel === "Employee"        ? { bg: "#04C3731A", color: "#04C373" } :
    roleLabel === "Full Stack Developer" ? { bg: "#04C3731A", color: "#04C373" } :
                                     { bg: "#AA24931A", color: "#AA2493" } ;
  return (
    <TableCell key={val}>
      <Chip
        label={roleLabel}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: roleCfg.bg, color: roleCfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Employee status chip (Active / Inactive) ──────────────────────────────
case "emp_status": {
  const isActive = row.status === "Active";
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: isActive ? "#04C3731A" : "#FF00001A",
          color:           isActive ? "#04C373"   : "#FF0000",
        }}
      />
    </TableCell>
  );
}

// ── Payslip bonus — green text ────────────────────────────────────────────
case "payslip_bonus":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#04C373">
        {row.bonus != null ? `Rs${row.bonus.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

// ── Payslip deductions — red text ─────────────────────────────────────────
case "payslip_deductions":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#FF0000">
        {row.deductions != null ? `Rs${row.deductions.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

// ── Payslip status chip (Paid / Pending) ──────────────────────────────────
case "payslip_status": {
  const isPaid = row.payslipStatus === "Paid";
  return (
    <TableCell key={val}>
      <Chip
        label={row.payslipStatus}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: isPaid ? "#04C3731A" : "#AA24931A",
          color:           isPaid ? "#04C373"   : "#AA2493",
        }}
      />
    </TableCell>
  );
}

// ── Payslip download action ───────────────────────────────────────────────
case "payslip_download":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={() => onDownloadClick?.(row)}
        sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
      >
        <img src={download} alt="download" style={{ width: 20, height: 20 }} />
      </IconButton>
    </TableCell>
  );

  // ── Attendance date ───────────────────────────────────────────────────────────
case "attendance_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.date}
      </Typography>
    </TableCell>
  );
 
// ── Attendance check-in time ──────────────────────────────────────────────────
case "attendance_check_in":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={500}
        color={row.checkIn === "—" ? "text.secondary" : "text.primary"}
      >
        {row.checkIn}
      </Typography>
    </TableCell>
  );
 
// ── Attendance check-out time ─────────────────────────────────────────────────
case "attendance_check_out":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={500}
        color={row.checkOut === "—" ? "text.secondary" : "text.primary"}
      >
        {row.checkOut}
      </Typography>
    </TableCell>
  );
 
// ── Attendance total hours ────────────────────────────────────────────────────
case "attendance_hours":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={500}
        color={row.hours === "—" ? "text.secondary" : "text.primary"}
      >
        {row.hours}
      </Typography>
    </TableCell>
  );
 
// ── Attendance status chip ────────────────────────────────────────────────────
case "attendance_status": {
  const cfg = ATTENDANCE_STATUS_CONFIG[row.attendanceStatus] || { bg: "#F5F5F5", color: "#9CA3AF" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.attendanceStatus}
        sx={{
          height: "26px",
          fontSize: "12px",
          fontWeight: 500,
          px: 1,
          borderRadius: "12px",
          backgroundColor: cfg.bg,
          color: cfg.color,
        }}
      />
    </TableCell>
  );
}

case "task_name":
   return (
     <TableCell key={val}>
       <Typography fontSize="13px" fontWeight={500} color="text.primary">
         {row.taskName || "-"}
       </Typography>
     </TableCell>
   );

// ── Task project (plain text) ─────────────────────────────────────────────
 case "task_project":
   return (
     <TableCell key={val}>
       <Typography fontSize="13px" fontWeight={400} color="text.black">
         {row.project || "-"}
       </Typography>
     </TableCell>
   );

// ── Task module (plain text, secondary colour for em dash) ────────────────
 case "task_module":
   return (
     <TableCell key={val}>
       <Typography
                fontSize="13px"
         fontWeight={400}
         color={row.module === "—" ? "text.secondary" : "text.black"}
       >
         {row.module || "-"}
       </Typography>
     </TableCell>
   );

// ── Performance avg time ──────────────────────────────────────────────────
case "perf_avg_time":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.avgTime ?? "-"}
      </Typography>
    </TableCell>
  );
 
// ── Performance view action (eye icon) ───────────────────────────────────
case "perf_view":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={() => onViewClick?.(row)}
        sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
      >
        <img src={viewIcon} alt="view" style={{ width: 20, height: 20 }} />
      </IconButton>
    </TableCell>
  );

  case "perf_days_overdue":
  return (
    <TableCell key={val}>
      {row.daysOverdue > 0 ? (
        <Chip
          label={`${row.daysOverdue} days`}
          sx={{
            height: "26px",
            fontSize: "12px",
            fontWeight: 500,
            px: 1,
            borderRadius: "12px",
            backgroundColor: "#FECACA",
            color: "#DC2626",
          }}
        />
      ) : (
        <Typography fontSize="13px" fontWeight={500} color="text.secondary">
          —
        </Typography>
      )}
    </TableCell>
  );

  case "role_name":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="text.primary">
        {row.roleName || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Role description ──────────────────────────────────────────────────────
case "role_description":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.description || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Role employee count ───────────────────────────────────────────────────
case "role_employees":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.employees ?? "-"}
      </Typography>
    </TableCell>
  );

  // ── Document type chip (colored) ──────────────────────────────────────────
case "doc_type_chip": {
  const DOC_TYPE_CONFIG = {
    "nda":                    { bg: "#AA24931A", color: "#AA2493", label: "NDA"                    },
    "employment_contract":    { bg: "#2B6EFF1A", color: "#2B6EFF", label: "Employment Contract"    },
    "project_documentation":  { bg: "#FF972F1A", color: "#FF972F", label: "Project Documentation"  },
    "client_agreement":       { bg: "#04C3731A", color: "#04C373", label: "Client Agreement"       },
    "id_document":            { bg: "#9E9E9E1A", color: "#034aac", label: "ID Document"            },
    "other":                  { bg: "#F5F5F5",   color: "#757575", label: "Other"                  },
  };
  const cfg = DOC_TYPE_CONFIG[row.type] || { bg: "#F5F5F5", color: "#757575", label: row.type };
  return (
    <TableCell key={val}>
      <Chip
        label={cfg.label}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Document name (bold) ──────────────────────────────────────────────────
case "doc_name_bold":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="text.primary">
        {row.fileName || "-"}
      </Typography>
    </TableCell>
  );

// ── Document uploaded by ──────────────────────────────────────────────────
case "doc_uploader":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.uploadedBy || "-"}
      </Typography>
    </TableCell>
  );

// ── Document date ─────────────────────────────────────────────────────────
case "doc_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.date || "-"}
      </Typography>
    </TableCell>
  );

// ── Document file size ────────────────────────────────────────────────────
case "doc_size":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.fileSize || "-"}
      </Typography>
    </TableCell>
  );

// ── Document actions (download + delete via 3-dot menu) ───────────────────
case "doc_actions_menu":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={(e) => handleMenuClick(e, row)}
        sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
      >
        <MoreVerticalIcon size={18} />
      </IconButton>
    </TableCell>
  );

  // ── Task due date ─────────────────────────────────────────────────────────
case "task_due_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.dueDate || "-"}
      </Typography>
    </TableCell>
  );

// ── Task status chip ──────────────────────────────────────────────────────
case "task_status_chip": {
  const TASK_STATUS_CONFIG = {
    "New":         { bg: "#2B6EFF1A", color: "#2B6EFF" },
    "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
    "Review":      { bg: "#9E9E9E1A", color: "#9E9E9E" },
    "Completed":   { bg: "#04C3731A", color: "#04C373" },
  };
  const cfg = TASK_STATUS_CONFIG[row.status] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Project name (plain) ──────────────────────────────────────────────────
case "proj_name":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.projectName || "-"}
      </Typography>
    </TableCell>
  );

// ── Project PM ────────────────────────────────────────────────────────────
case "proj_pm":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.pm || "-"}
      </Typography>
    </TableCell>
  );

// ── Project start date ────────────────────────────────────────────────────
case "proj_start_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.startDate || "-"}
      </Typography>
    </TableCell>
  );

// ── Project end date ──────────────────────────────────────────────────────
case "proj_end_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.endDate || "-"}
      </Typography>
    </TableCell>
  );
  // ── Attendance report — employee name ─────────────────────────────────────
case "att_report_member":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.name || "-"}
      </Typography>
    </TableCell>
  );

// ── Attendance report — present (green) ───────────────────────────────────
case "att_report_present":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="#04C373">
        {row.present ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Attendance report — absent (red) ──────────────────────────────────────
case "att_report_absent":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="#FF0000">
        {row.absent ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Attendance report — late (orange) ────────────────────────────────────
case "att_report_late":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="#F97316">
        {row.late ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Attendance report — leave (blue) ─────────────────────────────────────
case "att_report_leave":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="#2B6EFF">
        {row.leave ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Attendance report — rate with progress bar ────────────────────────────
case "att_report_rate":
  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: "80px",
            height: "6px",
            borderRadius: "3px",
            backgroundColor: "#F0F0F0",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: `${row.attendanceRate ?? 0}%`,
              height: "100%",
              borderRadius: "3px",
              background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
            }}
          />
        </Box>
        <Typography fontSize="13px" fontWeight={600} color="text.black">
          {row.attendanceRate ?? 0}%
        </Typography>
      </Box>
    </TableCell>
  );

  case "leave_report_member":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.name || "-"}
      </Typography>
    </TableCell>
  );

case "leave_report_type":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.leaveType || "-"}
      </Typography>
    </TableCell>
  );

case "leave_report_from":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.fromDate || "-"}
      </Typography>
    </TableCell>
  );

case "leave_report_to":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.toDate || "-"}
      </Typography>
    </TableCell>
  );

case "leave_report_days":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.days ?? "-"}
      </Typography>
    </TableCell>
  );

case "leave_report_approved_by":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color={row.approvedBy === "—" ? "text.secondary" : "text.black"}>
        {row.approvedBy || "—"}
      </Typography>
    </TableCell>
  );

case "leave_report_status": {
  const LEAVE_STATUS_CONFIG = {
    "Pending":  { bg: "#FF972F1A", color: "#FF972F" },
    "Approved": { bg: "#04C3731A", color: "#04C373" },
    "Rejected": { bg: "#FF00001A", color: "#FF0000" },
  };
  const cfg = LEAVE_STATUS_CONFIG[row.leaveStatus] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.leaveStatus}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

case "payroll_member":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.name || "-"}
      </Typography>
    </TableCell>
  );

case "payroll_base_salary":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        Rs{row.baseSalary?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );

case "payroll_bonus":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#04C373">
        Rs{row.bonus?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );

case "payroll_deductions":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#FF0000">
        Rs{row.deductions?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );

case "payroll_net_pay":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="text.primary">
        Rs{row.netPay?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );

  case "intg_no":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.no ?? "-"}
      </Typography>
    </TableCell>
  );

case "intg_project_id":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.projectId || "-"}
      </Typography>
    </TableCell>
  );

case "intg_project_name":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.projectName || "-"}
      </Typography>
    </TableCell>
  );

case "intg_git_url":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="12px"
        fontWeight={400}
        color="#2B6EFF"
        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
      >
        {row.gitUrl || "-"}
      </Typography>
    </TableCell>
  );

case "intg_commits":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.commits ?? "-"}
      </Typography>
    </TableCell>
  );

case "intg_status": {
  const isConnected = row.status === "Connected";
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: isConnected ? "#04C3731A" : "#F5F5F5",
          color:           isConnected ? "#04C373"   : "#9E9E9E",
        }}
      />
    </TableCell>
  );
}

case "commit_hash":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" fontWeight={500} color="text.secondary"
        sx={{ fontFamily: "monospace" }}>
        {row.commitHash || "-"}
      </Typography>
    </TableCell>
  );

case "commit_message":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.message || "-"}
      </Typography>
    </TableCell>
  );

case "commit_branch":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.branch || "-"}
      </Typography>
    </TableCell>
  );

case "commit_author":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.author || "-"}
      </Typography>
    </TableCell>
  );

case "commit_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.date || "-"}
      </Typography>
    </TableCell>
  );

case "commit_linked_task":
  return (
    <TableCell key={val}>
      {row.isLinked ? (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Link size={12} color="#67768B" />
          <Typography fontSize="12px" fontWeight={500} color="text.secondary">
             {row.linkedTask}
          </Typography>
        </Box>
      ) : (
        <Chip
          label="Link Task"
          sx={{
            height: "24px", fontSize: "12px", fontWeight: 500,
            px: 1, borderRadius: "12px",
            backgroundColor: "#04C3731A", color: "#04C373",
            cursor: "pointer",
          }}
        />
      )}
    </TableCell>
  );

  // In paginatedTable — add these cases to the switch statement

case "hr_leave_employee":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Avatar
          src={row.avatar}
          sx={{
            width:      28,
            height:     28,
            fontSize:   "11px",
            background: "linear-gradient(135deg, #AA2493, #022179)",
            color:      "#fff",
          }}
        >
          {row.name?.charAt(0)}
        </Avatar>
        <Typography fontSize="12px" fontWeight={500} color="text.primary">
          {row.name}
        </Typography>
      </Stack>
    </TableCell>
  );

case "hr_leave_type":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" color="text.secondary">
        {row.leaveType || "-"}
      </Typography>
    </TableCell>
  );

case "hr_leave_dates":
  return (
    <TableCell key={val}>
      <Typography fontSize="11px" color="text.secondary" lineHeight={1.6}>
        {row.fromDate}
      </Typography>
      <Typography fontSize="11px" color="text.secondary" lineHeight={1.6}>
        {row.toDate}
      </Typography>
    </TableCell>
  );

case "hr_leave_status": {
  const HR_LEAVE_STATUS = {
    Pending:  { bg: "#FEF3C7", color: "#D97706" }, 
    Approved: { bg: "#04C3731A", color: "#04C373" },
    Rejected: { bg: "#FF00001A", color: "#FF0000" },
  };
  const cfg = HR_LEAVE_STATUS[row.status] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        size="small"
        sx={{
          fontSize:        "11px",
          fontWeight:      500,
          backgroundColor: cfg.bg,
          color:           cfg.color,
          height:          "auto",
          py:              0.25,
        }}
      />
    </TableCell>
  );
}
case "hr_leave_actions":
  return (
    <TableCell key={val}>
      <Box display="flex" gap={0.75}>
        {row.status === "Pending" && (
          <>
            <Box
              onClick={() => onApproveClick?.(row)}
              sx={{
                px: "12px", py: "4px",
                borderRadius: "6px",
                backgroundColor: "#04C3731A",
                color: "#04C373",
                fontSize: "12px", fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
                cursor: "pointer", userSelect: "none",
                "&:hover": { backgroundColor: "#04C37330" },
              }}
            >
              Approve
            </Box>
            <Box
              onClick={() => onRejectClick?.(row)}
              sx={{
                px: "12px", py: "4px",
                borderRadius: "6px",
                backgroundColor: "#FF00001A",
                color: "#FF0000",
                fontSize: "12px", fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
                cursor: "pointer", userSelect: "none",
                "&:hover": { backgroundColor: "#FF000030" },
              }}
            >
              Reject
            </Box>
          </>
        )}
      </Box>
    </TableCell>
  );

  // ── Attendance monitoring — employee avatar + name ─────────────────────────
case "att_mon_employee":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Avatar
          src={row.avatar}
          alt={row.name}
          sx={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: "13px", fontWeight: 600,
          }}
        >
          {row.name?.charAt(0)}
        </Avatar>
        <Typography fontSize="13px" fontWeight={500} color="text.primary">
          {row.name}
        </Typography>
      </Stack>
    </TableCell>
  );

// ── Attendance monitoring — date ──────────────────────────────────────────
case "att_mon_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.black">
        {row.date || "—"}
      </Typography>
    </TableCell>
  );

// ── Attendance monitoring — check in ─────────────────────────────────────
case "att_mon_check_in":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color={!row.checkIn || row.checkIn === "—" ? "text.secondary" : "text.black"}>
        {row.checkIn || "—"}
      </Typography>
    </TableCell>
  );

// ── Attendance monitoring — check out ────────────────────────────────────
case "att_mon_check_out":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color={!row.checkOut || row.checkOut === "—" ? "text.secondary" : "text.black"}>
        {row.checkOut || "—"}
      </Typography>
    </TableCell>
  );

// ── Attendance monitoring — hours ─────────────────────────────────────────
case "att_mon_hours":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color={!row.hours || row.hours === "—" ? "text.secondary" : "text.black"}>
        {row.hours || "—"}
      </Typography>
    </TableCell>
  );

// ── Attendance monitoring — status chip ───────────────────────────────────
case "att_mon_status": {
  const ATT_MON_CONFIG = {
    Present: { bg: "#AA24931A", color: "#AA2493" },
    Absent:  { bg: "#FF00001A", color: "#FF0000" },
    Late:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
    Leave:   { bg: "#04C3731A", color: "#04C373" },
  };
  const cfg = ATT_MON_CONFIG[row.attendanceStatus] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.attendanceStatus}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Attendance monitoring — notes ─────────────────────────────────────────
case "att_mon_notes":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" color={!row.notes ? "text.secondary" : "text.black"}>
        {row.notes || "—"}
      </Typography>
    </TableCell>
  );

// ── Attendance Records — view + edit actions ──────────────────────────────
case "att_rec_actions":
  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <IconButton
          size="small"
          onClick={() => onViewClick?.(row)}
          sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
        >
          <img src={viewIcon} alt="view" style={{ width: 20, height: 20 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onEditClick?.(row)}
          sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
        >
          {React.isValidElement(EditIcon)
            ? EditIcon
            : typeof EditIcon === "string"
              ? <img src={EditIcon} alt="edit" style={{ width: 20, height: 20 }} />
              : EditIcon
                ? React.createElement(EditIcon, { style: { width: 20, height: 20 } })
                : null}
        </IconButton>
      </Box>
    </TableCell>
  );
  // ── Leave management — employee ───────────────────────────────────────────
case "lm_employee":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Avatar
          src={row.avatar}
          sx={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: "13px", fontWeight: 600,
          }}
        >
          {row.name?.charAt(0)}
        </Avatar>
        <Typography fontSize="13px" fontWeight={500} color="text.primary">
          {row.name}
        </Typography>
      </Stack>
    </TableCell>
  );

// ── Leave management — type ───────────────────────────────────────────────
case "lm_type":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.black">
        {row.leaveType || "-"}
      </Typography>
    </TableCell>
  );

// ── Leave management — from & to dates stacked ────────────────────────────
case "lm_dates":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" color="text.secondary" lineHeight={1.8}>
        {row.fromDate}
      </Typography>
      <Typography fontSize="12px" color="text.secondary" lineHeight={1.8}>
        {row.toDate}
      </Typography>
    </TableCell>
  );

// ── Leave management — days ───────────────────────────────────────────────
case "lm_days":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.days ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Leave management — reason ─────────────────────────────────────────────
case "lm_reason":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="12px"
        color="text.secondary"
        sx={{
          maxWidth: "160px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.reason || "-"}
      </Typography>
    </TableCell>
  );

// ── Leave management — submitted date ─────────────────────────────────────
case "lm_submitted":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" color="text.secondary">
        {row.submittedDate || "-"}
      </Typography>
    </TableCell>
  );

// ── Leave management — status chip ────────────────────────────────────────
case "lm_status": {
  const LM_STATUS = {
    Pending:  { bg: "#FF972F1A", color: "#FF972F" },
    Approved: { bg: "#04C3731A", color: "#04C373" },
    Rejected: { bg: "#FF00001A", color: "#FF0000" },
  };
  const cfg = LM_STATUS[row.status] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "12px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Leave management — approve/reject + view actions ──────────────────────
case "lm_actions":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={() => onViewClick?.(row)}
        sx={{ color: "#666", "&:hover": { backgroundColor: "#f5f5f5" } }}
      >
        <img src={viewIcon} alt="view" style={{ width: 18, height: 18 }} />
      </IconButton>
    </TableCell>
  );
  // ── Payroll — checkbox ────────────────────────────────────────────────────
case "payroll_checkbox":
  return (
    <TableCell key={val} sx={{ width: "50px" }}>
      <Checkbox
        checked={selectedRows?.includes(row.id)}
        onChange={() => onSelectRow?.(row.id)}
        sx={{
          color: "#D1D5DB",
          "&.Mui-checked": {
            color: "#AA2493",
          },
        }}
      />
    </TableCell>
  );

// ── Payroll — emp ID ──────────────────────────────────────────────────────
case "payroll_emp_id":
  return (
    <TableCell key={val}>
      <Typography fontSize="12px" fontWeight={500} color="text.secondary">
        {row.empId || "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — employee avatar + name + designation ────────────────────────
case "payroll_employee":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Avatar
          src={row.avatar}
          sx={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #AA2493, #022179)",
            fontSize: "13px", fontWeight: 600,
          }}
        >
          {row.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontSize="13px" fontWeight={600} color="text.primary">
            {row.name}
          </Typography>
          <Typography fontSize="11px" color="text.secondary">
            {row.designation}
          </Typography>
        </Box>
      </Stack>
    </TableCell>
  );

// ── Payroll — department ──────────────────────────────────────────────────
case "payroll_department":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.black">
        {row.department || "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — working days ────────────────────────────────────────────────
case "payroll_working":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.working ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — present days ────────────────────────────────────────────────
case "payroll_present":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.present ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — leave days ──────────────────────────────────────────────────
case "payroll_leave":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.leave ?? "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — base salary ─────────────────────────────────────────────────
case "payroll_salary":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.baseSalary ? `$${row.baseSalary.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — bonus (green) ───────────────────────────────────────────────
case "payroll_bonus_col":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#04C373">
        {row.bonus ? `$${row.bonus.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — deductions (red) ────────────────────────────────────────────
case "payroll_deductions_col":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#FF0000">
        {row.deductions ? `$${row.deductions.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

// ── Payroll — net pay ─────────────────────────────────────────────────────
case "payroll_net":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={700} color="text.primary">
        {row.netPay ? `$${row.netPay.toLocaleString()}` : "-"}
      </Typography>
    </TableCell>
  );

  // ── Task list — title ─────────────────────────────────────────────────────
case "task_list_title":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.title || "-"}
      </Typography>
    </TableCell>
  );

// ── Task list — project ───────────────────────────────────────────────────
case "task_list_project":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.black">
        {row.project || "-"}
      </Typography>
    </TableCell>
  );

// ── Task list — module ────────────────────────────────────────────────────
case "task_list_module":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.secondary">
        {row.module || "-"}
      </Typography>
    </TableCell>
  );

// ── Task list — priority chip ─────────────────────────────────────────────
case "task_list_priority": {
  const TL_PRIORITY = {
    High:   { bg: "#04C3731A", color: "#04C373" },
    Medium: { bg: "#AA24931A", color: "#AA2493" },
    Low:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
  };
  const cfg = TL_PRIORITY[row.priority] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.priority}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "8px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Task list — status chip ───────────────────────────────────────────────
case "task_list_status": {
  const TL_STATUS = {
    "New":         { bg: "#2B6EFF1A", color: "#2B6EFF" },
    "Assigned":    { bg: "#AA24931A", color: "#AA2493" },
    "In Progress": { bg: "#FF972F1A", color: "#FF972F" },
    "Review":      { bg: "#9E9E9E1A", color: "#9E9E9E" },
    "Completed":   { bg: "#04C3731A", color: "#04C373" },
  };
  const cfg = TL_STATUS[row.status] || { bg: "#F5F5F5", color: "#757575" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        sx={{
          height: "24px", fontSize: "12px", fontWeight: 500,
          px: 1, borderRadius: "8px",
          backgroundColor: cfg.bg, color: cfg.color,
        }}
      />
    </TableCell>
  );
}

// ── Task list — deadline ──────────────────────────────────────────────────
case "task_list_deadline":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" color="text.black">
        {row.deadline || "-"}
      </Typography>
    </TableCell>
  );

  case "tp_member":
  return (
    <TableCell key={val}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Avatar
          src={row.avatar}
          alt={row.name}
          sx={{
            width: 36,
            height: 36,
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {row.name?.charAt(0) || "A"}
        </Avatar>
        <Typography fontSize="13px" fontWeight={500} color="text.primary">
          {row.name}
        </Typography>
      </Stack>
    </TableCell>
  );
 
// ── Team Performance — role (plain text) ─────────────────────────────────
case "tp_role":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.role || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Team Performance — total tasks count ─────────────────────────────────
case "tp_total_tasks":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.totalTasks ?? "-"}
      </Typography>
    </TableCell>
  );
 
// ── Team Performance — completed count (green when > 0) ──────────────────
case "tp_completed":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={500}
        color={row.completed > 0 ? "#04C373" : "text.secondary"}
      >
        {row.completed ?? "-"}
      </Typography>
    </TableCell>
  );
 
// ── Team Performance — active count ──────────────────────────────────────
case "tp_active":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.active ?? "-"}
      </Typography>
    </TableCell>
  );
 
// ── Team Performance — overdue count (red when > 0) ──────────────────────
case "tp_overdue":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={500}
        color={row.overdue > 0 ? "#FF0000" : "text.secondary"}
      >
        {row.overdue ?? "-"}
      </Typography>
    </TableCell>
  );
 
// ── Team Performance — completion rate with progress bar ─────────────────
case "tp_completion_rate":
  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: "80px",
            height: "6px",
            borderRadius: "3px",
            backgroundColor: "#F0F0F0",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: `${row.completionRate ?? 0}%`,
              height: "100%",
              borderRadius: "3px",
              background:
                row.completionRate > 0
                  ? "linear-gradient(90deg, #022179 0%, #AA2493 100%)"
                  : "#E0E0E0",
            }}
          />
        </Box>
        <Typography fontSize="13px" fontWeight={600} color="text.black">
          {row.completionRate ?? 0}%
        </Typography>
      </Box>
    </TableCell>
  );

  case "tl_task":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.taskName || "-"}
      </Typography>
      {row.project && (
        <Chip
          label={row.project}
          size="small"
          sx={{
            mt: 0.5,
            height: "20px",
            fontSize: "11px",
            fontWeight: 500,
            borderRadius: "6px",
            backgroundColor: "#2B6EFF1A",
            color: "#2B6EFF",
          }}
        />
      )}
    </TableCell>
  );
 case "att_status": {
  const cfg = {
    Present: { bg: "#04C3731A", color: "#04C373" },
    Absent:  { bg: "#FF00001A", color: "#FF0000" },
    Late:    { bg: "#AA24931A", color: "#AA2493" },
    Leave:   { bg: "#0051FF1A", color: "#2B6EFF" },
    Weekend: { bg: "#F5F5F5",   color: "#888888" },
  }[row.status] || {};
  return (
    <Chip
      label={row.status}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 500, fontSize: 11 }}
    />
  );
}
case "att_status": {
  const ATT_CFG = {
    Present: { bg: "#04C3731A", color: "#04C373" },
    Absent:  { bg: "#FF00001A", color: "#FF0000" },
    Late:    { bg: "#AA24931A", color: "#AA2493" },
    Leave:   { bg: "#0051FF1A", color: "#2B6EFF" },
    Weekend: { bg: "#F5F5F5",   color: "#888888" },
  };
  const cfg = ATT_CFG[row.status] || { bg: "#F5F5F5", color: "#888888" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        size="small"
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 500, fontSize: 11 }}
      />
    </TableCell>
  );
}

case "leave_status": {
  const LEAVE_CFG = {
    Approved: { bg: "#04C3731A", color: "#04C373" },
    Pending:  { bg: "#AA24931A", color: "#AA2493" },
    Reject:   { bg: "#FF00001A", color: "#FF0000" },
  };
  const cfg = LEAVE_CFG[row.status] || { bg: "#F5F5F5", color: "#888888" };
  return (
    <TableCell key={val}>
      <Chip
        label={row.status}
        size="small"
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 500, fontSize: 11 }}
      />
    </TableCell>
  );
}

case "leave_action":
  return (
    <TableCell key={val}>
      {row.status === "Pending" ? (
        <Button
          variant="gradient"
          size="small"
          sx={{ fontSize: 11, px: 2, py: 0.5, borderRadius: "8px" }}
          onClick={() => console.log("Cancel", row.id)}
        >
          Cancel
        </Button>
      ) : null}
    </TableCell>
  );
// ── Time Log — date ───────────────────────────────────────────────────────
case "tl_date":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {row.date || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Time Log — duration ───────────────────────────────────────────────────
case "tl_duration":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.duration || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Time Log — type chip (Timer = green, Manual = purple) ─────────────────
case "tl_type": {
  const isTimer = row.type === "Timer";
  return (
    <TableCell key={val}>
      <Chip
        label={row.type}
        size="small"
        sx={{
          height: "24px",
          fontSize: "12px",
          fontWeight: 500,
          px: 1,
          borderRadius: "8px",
          backgroundColor: isTimer ? "#04C3731A" : "#AA24931A",
          color:           isTimer ? "#04C373"   : "#AA2493",
        }}
      />
    </TableCell>
  );
}
 
// ── Time Log — note (plain text, secondary color) ─────────────────────────
case "tl_note":
  return (
    <TableCell key={val}>
      <Typography
        fontSize="13px"
        fontWeight={400}
        color={row.note ? "text.black" : "text.secondary"}
      >
        {row.note || "—"}
      </Typography>
    </TableCell>
  );
 
// ── Time Log — delete icon button ────────────────────────────────────────
case "tl_delete":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={() => onDeleteClick?.(row)}
        sx={{ color: "#9CA3AF", "&:hover": { color: "#FF0000", backgroundColor: "#FF00001A" } }}
      >
        <img src={Delete} alt="delete" style={{ width: 20, height: 20 }} />
      </IconButton>
    </TableCell>
  );

  case "bbt_task_name":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.taskName || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Breakdown by Task — project ───────────────────────────────────────────
case "bbt_project":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.project || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Breakdown by Task — hours logged ──────────────────────────────────────
case "bbt_hours_logged":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.hoursLogged || "-"}
      </Typography>
    </TableCell>
  );

  // ── Payslip History — month (plain text) ─────────────────────────────────────
case "ps_month":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.primary">
        {row.month || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Payslip History — base salary ────────────────────────────────────────────
case "ps_base_salary":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        Rs{row.baseSalary?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Payslip History — bonus (green) ──────────────────────────────────────────
case "ps_bonus":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#04C373">
        Rs{row.bonus?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Payslip History — deductions (red) ───────────────────────────────────────
case "ps_deductions":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="#FF0000">
        Rs{row.deductions?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Payslip History — net pay (bold) ─────────────────────────────────────────
case "ps_net_pay":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="text.primary">
        Rs{row.netPay?.toLocaleString() || "-"}
      </Typography>
    </TableCell>
  );
 
// ── Payslip History — download icon button ────────────────────────────────────
case "ps_download":
  return (
    <TableCell key={val}>
      <IconButton
        size="small"
        onClick={() => onDownloadClick?.(row)}
        sx={{ color: "#67768B", "&:hover": { backgroundColor: "#f5f5f5" } }}
      >
        <img src={download} alt="download" style={{ width: 20, height: 20 }} />
      </IconButton>
    </TableCell>
  );
 
// ── Breakdown by Task — % of week with gradient progress bar ──────────────
case "bbt_percent":
  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: "80px",
            height: "6px",
            borderRadius: "3px",
            backgroundColor: "#F0F0F0",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: `${row.percent ?? 0}%`,
              height: "100%",
              borderRadius: "3px",
              background: row.percent > 0
                ? "linear-gradient(90deg, #022179 0%, #AA2493 100%)"
                : "#E0E0E0",
            }}
          />
        </Box>
        <Typography fontSize="13px" fontWeight={600} color="text.black">
          {row.percent ?? 0}%
        </Typography>
      </Box>
    </TableCell>
  );

  // ── Department name ───────────────────────────────────────────────────────
case "dept_name":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={600} color="text.primary">
        {row.name || "-"}
      </Typography>
    </TableCell>
  );

// ── Department description ────────────────────────────────────────────────
case "dept_description":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.secondary">
        {row.description || "-"}
      </Typography>
    </TableCell>
  );

// ── Department employee count ─────────────────────────────────────────────
case "dept_employees":
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={500} color="text.black">
        {row.employees ?? "-"}
      </Typography>
    </TableCell>
  );
case "task_assignees": {
  const ALL_ASSIGNEES = [
    { value: "sara_ahmed", label: "Sara Ahmed"    },
    { value: "jon",        label: "Jon"           },
    { value: "peter",      label: "Peter"         },
    { value: "sarah",      label: "Sarah"         },
    { value: "sarah_chen", label: "Sarah Chen"    },
    { value: "marcus",     label: "Marcus Webb"   },
    { value: "priya",      label: "Priya Patel"   },
    { value: "jake",       label: "Jake Morrison" },
    { value: "emily",      label: "Emily Ross"    },
    { value: "david",      label: "David Kim"     },
  ];

  const ids     = Array.isArray(row.assigneeIds) ? row.assigneeIds : [];
  const matched = ALL_ASSIGNEES.filter((a) => ids.includes(a.value));
  const visible  = matched.slice(0, 2);
  const overflow = matched.slice(2);

  const [showAll, setShowAll] = React.useState(false);

  return (
    <TableCell key={val}>
      <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">

        {/* First 2 names as chips */}
        {visible.map((a) => (
          <Box
            key={a.value}
            sx={{
              px: "8px", py: "3px",
              borderRadius: "6px",
              backgroundColor: "#F0F0F0",
              fontSize: "12px",
              fontWeight: 500,
              color: "#374151",
              whiteSpace: "nowrap",
            }}
          >
            {a.label}
          </Box>
        ))}

        {/* +N more chip — click to expand */}
        {!showAll && overflow.length > 0 && (
          <Box
            onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
            sx={{
              px: "8px", py: "3px",
              borderRadius: "6px",
              backgroundColor: "#AA24931A",
              fontSize: "12px",
              fontWeight: 600,
              color: "#AA2493",
              cursor: "pointer",
              whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#AA249330" },
            }}
          >
            +{overflow.length} more
          </Box>
        )}

        {/* Expanded names */}
        {showAll && overflow.map((a) => (
          <Box
            key={a.value}
            sx={{
              px: "8px", py: "3px",
              borderRadius: "6px",
              backgroundColor: "#F0F0F0",
              fontSize: "12px",
              fontWeight: 500,
              color: "#374151",
              whiteSpace: "nowrap",
            }}
          >
            {a.label}
          </Box>
        ))}

        {/* Collapse button */}
        {showAll && overflow.length > 0 && (
          <Box
            onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
            sx={{
              px: "8px", py: "3px",
              borderRadius: "6px",
              backgroundColor: "#F5F5F5",
              fontSize: "12px",
              fontWeight: 600,
              color: "#9CA3AF",
              cursor: "pointer",
              whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#E5E5E5" },
            }}
          >
            less
          </Box>
        )}

      </Box>
    </TableCell>
  );
}


case "proj_type_label": {
  const typeList = projectTypes.length ? projectTypes : [];
  const matched  = typeList.find((t) => t.value === row.projectType);
  const label    = matched?.label || row.projectType || "-";
  return (
    <TableCell key={val}>
      <Typography fontSize="13px" fontWeight={400} color="text.black">
        {label}
      </Typography>
    </TableCell>
  );
}
  
  // ── Default: plain text ───────────────────────────────────────────────
      default:
        return (
          <TableCell key={val}>
            <Typography fontSize="13px" fontWeight={500} color="text.black">
              {row[val] ?? "-"}
            </Typography>
          </TableCell>
        );
    }
  };

  const paginatedData = serverSidePagination
    ? tableData
    : tableData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer>
      <Table sx={{ width: tableWidth || "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
        <TableHead>
          <TableRow>
            {tableHeader.map((h, index) => (
          <TableCell
            key={h.id}
            align={h.align || "left"}
            sx={{
              backgroundColor: headerBgColor,
              borderBottom: "none",
              padding: "12px 16px",
              minWidth: h.minWidth || "auto",
              ...(index === 0 && { borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }),
              ...(index === tableHeader.length - 1 && { borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }),
            }}
          >
            {h.id === "checkbox" ? (
              <Checkbox
                checked={
                  tableData?.length > 0 &&
                  selectedRows?.length === tableData?.length
                }
                indeterminate={
                  selectedRows?.length > 0 &&
                  selectedRows?.length < tableData?.length
                }
                onChange={onSelectAll}
                sx={{
                  color: "#D1D5DB",
                  "&.Mui-checked": { color: "#AA2493" },
                  "&.MuiCheckbox-indeterminate": { color: "#AA2493" },
                }}
              />
            ) : (
              <Typography fontSize="13px" fontWeight={600} color="text.secondary">
                {h.label}
              </Typography>
            )}
          </TableCell>
        ))}
          </TableRow>
        </TableHead>

        {isLoading ? (
          <TableSkeleton columns={columnKeys.length} rows={5} />
        ) : (
          <TableBody>
            {paginatedData?.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow
                  key={getRowId(row)}
                  sx={{ "& > td": { verticalAlign: "middle" }, "&:hover": { backgroundColor: "#FAFAFB" } }}
                >
                  {columnKeys.map((val) => renderCell(row, val, index))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnKeys.length}>
                  <Typography fontSize="13px" color="text.secondary" textAlign="center" py={4}>
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>

      {showPagination && !hidepagination && (
        <TablePagination
          component="div"
          count={totalCount || tableData?.length || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, boxShadow: "0px 4px 20px rgba(0,0,0,0.1)", borderRadius: "12px", minWidth: "160px" } }}
      >
        {(typeof menuOptions === "function" && selectedRow
          ? menuOptions(selectedRow)
          : Array.isArray(menuOptions)
          ? menuOptions
          : []
        ).map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleMenuItemClick(option.value)}
            sx={{
              fontSize: "13px",
              padding: "10px 16px",
              color: option.color || "#030229",
              "&:hover": { backgroundColor: option.color ? `${option.color}1A` : "#F5F5F5" },
            }}
          >
            {option.icon && <ListItemIcon sx={{ minWidth: "32px" }}>{option.icon}</ListItemIcon>}
            <ListItemText primary={option.label} primaryTypographyProps={{ fontSize: "13px", fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </TableContainer>
  );
}