// hrPortal/attendance/attendanceDetail/index.jsx — 
import { useState }                            from "react";
import { Box, IconButton, Typography, Avatar } from "@mui/material";
import { useNavigate, useLocation }            from "react-router-dom";

import CustomTabs        from "../../../components/tabs";
import DetailTableTab    from "./detailTableTab";
import DetailCalendarTab from "./detailCalendarTab";
import backIcon          from "../../../assets/icons/downlaod-back-btn.svg";
import { useAttendanceDetail } from "../../../hooks/attendance";

const tabs = [
  { id: 1, label: "Table View"    },
  { id: 2, label: "Calendar View" },
];

const AttendanceDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    employee = {},
    employeeId,
    month: monthRaw,
    year:  yearRaw,
  } = location.state || {};

  const month = typeof monthRaw === "number" ? monthRaw : parseInt(monthRaw);
  const year  = typeof yearRaw  === "number" ? yearRaw  : parseInt(yearRaw);

  const [activeTab, setActiveTab] = useState(1);

  const {
    records, loading, actionLoading, updateRecord, createManualEntry, setRecords,
  } = useAttendanceDetail(employeeId, month, year);

const handleEditSave = async (updated) => {
    return await updateRecord(updated.id, {
      checkIn:          updated.checkIn,
      checkOut:         updated.checkOut,
      attendanceStatus: updated.attendanceStatus,
      notes:            updated.notes,
      offSiteHours:     updated.offSiteHours,
      extraHours:       updated.extraHours,
    });
  };

  // Manual Entry — creates a brand-new record for a date that has none
  const handleManualEntrySave = async (payload) => {
    return await createManualEntry(payload);
  };

  const monthName = month !== undefined
    ? new Date(year, month, 1).toLocaleString("default", { month: "long" })
    : "";

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
          Back to Attendance Records
        </Typography>
      </Box>

      <Box sx={{
        display: "flex", alignItems: "center", gap: 2,
        backgroundColor: "#fff", borderRadius: "20px",
        px: 3, py: 2.5, mb: 2,
      }}>
        <Avatar
          src={employee.avatar}
          sx={{ width: 52, height: 52, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "18px", fontWeight: 700 }}
        >
          {employee.name?.charAt(0)}
        </Avatar>
        <Box flex={1}>
          <Typography fontSize="16px" fontWeight={700} color="text.primary">
            {employee.name || "—"}
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
            {employee.empId ? `${employee.empId} · ` : ""}
            {employee.designation || employee.department || "—"}
          </Typography>
        </Box>
        {monthName && (
          <Box sx={{ backgroundColor: "#F0E8FA", borderRadius: "10px", px: 2, py: 1 }}>
            <Typography fontSize="13px" fontWeight={600} color="#AA2493">
              {monthName} {year}
            </Typography>
          </Box>
        )}
      </Box>

      <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 1 && (
        <DetailTableTab
          dailyRecords={records}
          loading={loading}
          actionLoading={actionLoading}
          employeeId={employeeId}
          onEditSave={handleEditSave}
          onManualEntrySave={handleManualEntrySave}
          onRecordsChange={setRecords}
        />
      )}
      {activeTab === 2 && (
        <DetailCalendarTab
          dailyRecords={records}
          initialMonth={month}
          initialYear={year}
        />
      )}
    </>
  );
};

export default AttendanceDetail;