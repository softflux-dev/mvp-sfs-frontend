// hrPortal/attendance/partialPunchDialog.jsx 
import { useState, useEffect } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { Edit2, CheckCircle } from "lucide-react";

import { DialogContainer, DialogHeader, DialogBody } from "../../../components";
import SuccessPopup        from "../../../components/popups/confirmationDialog";
import EditAttendanceDialog from "./editAttendanceDialog";
import { getPartialRecordsApi, updateAttendanceRecordApi } from "../../../api/modules/attendance";

const PartialPunchDialog = ({ open, onClose, onCountChange }) => {
  const [records,      setRecords]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [editingRow,   setEditingRow]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [successOpen,  setSuccessOpen]  = useState(false);

  const fetchPartial = async () => {
    setLoading(true);
    try {
      const res = await getPartialRecordsApi();
      if (res?.status === 200 || res?.status === 201) {
        const fetched = res.data.data.records || [];
        setRecords(fetched);
        onCountChange?.(fetched.length);   // keep parent count in sync
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) fetchPartial(); }, [open]);

  const handleEditSave = async (updated) => {
    setSaving(true);
    try {
      const res = await updateAttendanceRecordApi(updated.id, {
        checkIn:          updated.checkIn,
        checkOut:         updated.checkOut,
        attendanceStatus: updated.attendanceStatus,
        notes:            updated.notes,
      });
      if (res?.status === 200 || res?.status === 201) {
        // Remove resolved record from list instantly
        const remaining = records.filter((r) => r.id?.toString() !== updated.id?.toString());
        setRecords(remaining);
        onCountChange?.(remaining.length);  // update banner count in parent
        setSuccessOpen(true);
        setEditOpen(false);
        setEditingRow(null);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <>
      <DialogContainer open={open} onClose={onClose} maxWidth="600px" fullWidth>
        <DialogHeader title={`Incomplete Punch Records${records.length > 0 ? ` (${records.length})` : ""}`} onClose={onClose} />

        <DialogBody>
          {/* Info banner */}
          <Box sx={{ backgroundColor: "#FFF7E6", borderRadius: "12px", p: 2, mb: 2, border: "1px solid #FFE0A3" }}>
            <Typography fontSize="13px" color="#B45309">
              These employees have only one punch recorded (missing check-in or check-out). Click the edit icon to fill in the missing time manually.
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} sx={{ color: "#AA2493" }} />
            </Box>
          ) : records.length === 0 ? (
            <Box textAlign="center" py={5} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
              <CheckCircle size={36} color="#04C373" />
              <Typography fontSize="14px" fontWeight={600} color="#04C373">All resolved!</Typography>
              <Typography fontSize="13px" color="text.secondary">No incomplete punch records remaining.</Typography>
            </Box>
          ) : (
            <Box sx={{
              display: "flex", flexDirection: "column", gap: 1,
              maxHeight: 420, overflowY: "auto",
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" },
            }}>
              {records.map((rec) => (
                <Box key={rec.id} sx={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "#F9F9F9", borderRadius: "12px", px: 2, py: 1.5 }}>
                  <Avatar src={rec.avatar}
                    sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #AA2493, #022179)", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}
                  >
                    {rec.name?.charAt(0)}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography fontSize="13px" fontWeight={600} color="text.primary">
                      {rec.name}
                      <Typography component="span" fontSize="11px" color="text.secondary" ml={1}>{rec.empId}</Typography>
                    </Typography>
                    <Typography fontSize="11px" color="text.secondary">{rec.date}</Typography>
                  </Box>

                  {/* Show which field is missing */}
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                    <Box sx={{
                      px: 1.25, py: 0.35, borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: rec.checkIn ? "#04C3731A" : "#FF00001A",
                      color:           rec.checkIn ? "#04C373"   : "#FF0000",
                    }}>
                      In: {rec.checkIn || "Missing"}
                    </Box>
                    <Box sx={{
                      px: 1.25, py: 0.35, borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: rec.checkOut ? "#04C3731A" : "#FF00001A",
                      color:           rec.checkOut ? "#04C373"   : "#FF0000",
                    }}>
                      Out: {rec.checkOut || "Missing"}
                    </Box>
                  </Box>

                  <Box
                    onClick={() => { setEditingRow(rec); setEditOpen(true); }}
                    sx={{
                      width: 32, height: 32, borderRadius: "8px", backgroundColor: "#F0E8FA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                      "&:hover": { backgroundColor: "#AA249320" },
                    }}
                  >
                    <Edit2 size={14} color="#AA2493" />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogBody>
      </DialogContainer>

      {/* Edit dialog — pre-fills with existing record data */}
      <EditAttendanceDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingRow(null); }}
        record={editingRow}
        onSave={handleEditSave}
        loading={saving}
      />

      <SuccessPopup
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Attendance record updated successfully."
        autoClose
        autoCloseDelay={2000}
      />
    </>
  );
};

export default PartialPunchDialog;