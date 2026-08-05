import { useEffect } from "react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useEmployeeAccountHistory } from "../../../../hooks/employeeAccountHistory";

const EVENT_CONFIG = {
  created:     { label: "Account Created", bg: "#DBEAFE", color: "#2563EB", Icon: CheckCircle },
  deactivated: { label: "Deactivated",     bg: "#FECACA", color: "#DC2626", Icon: XCircle },
  reactivated: { label: "Reactivated",     bg: "#D1FAE5", color: "#059669", Icon: RotateCcw },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : "—";

const AccountHistoryTab = ({ employee = {} }) => {
  const { events, loading, error, fetchHistory } = useEmployeeAccountHistory();

  useEffect(() => {
    if (employee.id) fetchHistory(employee.id);
  }, [employee.id, fetchHistory]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={28} sx={{ color: "#AA2493" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2} px={2} py={1.5}
        sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
      >
        <Typography fontSize={13} color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={3}>
      <Typography fontSize="14px" fontWeight={700} color="text.primary" mb={2}>
        Account Timeline
      </Typography>

      {events.length === 0 ? (
        <Typography fontSize="13px" color="text.secondary" textAlign="center" py={4}>
          No account history available yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {events.map((ev, idx) => {
            const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.created;
            const Icon = cfg.Icon;
            const isLast = idx === events.length - 1;
            return (
              <Box key={idx} sx={{ display: "flex", gap: 2 }}>
                {/* Timeline rail */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    backgroundColor: cfg.bg, color: cfg.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </Box>
                  {!isLast && <Box sx={{ width: "2px", flex: 1, backgroundColor: "#E5E7EB", minHeight: "28px" }} />}
                </Box>

                {/* Content */}
                <Box sx={{ pb: isLast ? 0 : 2.5, pt: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={cfg.label}
                      sx={{
                        height: "22px", fontSize: "11px", fontWeight: 700,
                        px: 1, borderRadius: "8px",
                        backgroundColor: cfg.bg, color: cfg.color,
                      }}
                    />
                    <Typography fontSize="12px" color="text.secondary">
                      {formatDate(ev.date)}
                    </Typography>
                  </Box>

                  {ev.performedBy && (
                    <Typography fontSize="12px" color="text.secondary" mt={0.5}>
                      By {ev.performedBy}
                    </Typography>
                  )}
                  {ev.reason && (
                    <Typography fontSize="12px" color="text.black" mt={0.5}>
                      Reason: {ev.reason}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default AccountHistoryTab;