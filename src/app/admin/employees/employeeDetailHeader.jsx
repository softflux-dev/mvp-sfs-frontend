import { Box, Typography, Chip, Avatar } from "@mui/material";
import CustomButton from "../../../components/customButton";
import editIcon from "../../../assets/icons/edit-icon.svg";
import { baseUrl } from "../../../api/index";

const getBackendOrigin = () => baseUrl.replace(/\/api\/?$/, "");

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http") || avatarUrl.startsWith("blob:")) return avatarUrl;
  return `${getBackendOrigin()}${avatarUrl}`;
};

const EmployeeDetailHeader = ({ employee = {}, onEditClick }) => {
  const isActive = employee.status === "Active";

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={resolveAvatarUrl(employee.avatar)}  
            alt={employee.name}
            sx={{
              width: 72, height: 72,
             
              fontSize: "24px", fontWeight: 700,
            }}
          >
            {employee.name?.charAt(0) || "A"}
          </Avatar>

          <Box>
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
            <Typography fontSize="13px" color="text.secondary" mb={0.25}>
              {[employee.role, employee.department].filter(Boolean).join(" · ")}
            </Typography>
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