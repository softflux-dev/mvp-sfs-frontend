// employees/employeeDetailHeader.jsx
import { Box, Typography, Chip, Avatar } from "@mui/material";
import CustomButton from "../../../components/customButton";
import editIcon from "../../../assets/icons/edit-icon.svg";

const EmployeeDetailHeader = ({ employee = {}, onEditClick }) => {
  const isActive = employee.status === "Active";

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 3 }}>
      {/* ── Top row: avatar block + Edit button ──────────────────────────── */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>

        {/* Left — avatar + name + meta ── */}
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={employee.avatar || ""}
            alt={employee.name}
            sx={{
              width: 72, height: 72,
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              fontSize: "24px", fontWeight: 700,
            }}
          >
            {employee.name?.charAt(0) || "A"}
          </Avatar>

          <Box>
            {/* Name + status chip */}
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography fontSize="22px" fontWeight={700} color="text.primary">
                {employee.name || "—"}
              </Typography>
              <Chip
                label={employee.status || "Active"}
                sx={{
                  height: "22px", fontSize: "11px", fontWeight: 600,
                  px: 1, borderRadius: "8px",
                  backgroundColor: isActive ? "#04C3731A" : "#FF00001A",
                  color:           isActive ? "#04C373"   : "#FF0000",
                }}
              />
            </Box>

            {/* Role · Department */}
            <Typography fontSize="13px" color="text.secondary" mb={0.25}>
              {[employee.role, employee.department].filter(Boolean).join(" · ")}
            </Typography>

            {/* Emp ID */}
            <Typography fontSize="12px" color="text.secondary" fontWeight={500}>
              {employee.empId || "EMP001"}
            </Typography>
          </Box>
        </Box>

        <CustomButton
          btnLabel="Edit Employee"
          variant="gradientText"
          handlePressBtn={onEditClick}
          startIcon={<img src={editIcon} alt="edit" style={{ width: 15, height: 15 }} />}
        />
      </Box>
    </Box>
  );
};

export default EmployeeDetailHeader;