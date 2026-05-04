import { Box, Typography, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";

const BranchCard = ({ branchName, branchNameAr, location, students, status, icon }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxShadow: "none",
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          border: "1px solid #E0E0E0",
        },
      }}
    >
      {/* Header with Icon and Status */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon || <ApartmentIcon sx={{ color: "#fff", fontSize: 24 }} />}
        </Box>
        
        <Chip
          label={status}
          variant={status === "Active" ? "mainChip" : "default"}
          size="small"
        />
      </Box>

      {/* Branch Names */}
      <Box>
        <Typography
          fontSize="18px"
          fontWeight={600}
          color="text.primary"
          mb={0.5}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {branchName}
        </Typography>
        <Typography
          fontSize="14px"
          fontWeight={400}
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {branchNameAr}
        </Typography>
      </Box>

      {/* Location */}
      <Box display="flex" alignItems="center" gap={1}>
        <LocationOnIcon sx={{ color: "text.secondary", fontSize: 18 }} />
        <Typography fontSize="14px" color="text.secondary">
          {location}
        </Typography>
      </Box>

      {/* Students Count */}
      <Box display="flex" alignItems="center" gap={1}>
        <PeopleIcon sx={{ color: "text.secondary", fontSize: 18 }} />
        <Typography fontSize="14px" color="text.secondary">
          {students}
        </Typography>
      </Box>
    </Box>
  );
};

export default BranchCard;