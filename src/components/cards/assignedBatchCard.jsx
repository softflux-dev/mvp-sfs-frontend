import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomButton from "../customButton";

import batchIcon from "../../assets/icons/batch.svg";
import locationIcon from "../../assets/icons/location.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import levelIcon from "../../assets/icons/enrolledCourses.svg";
import programIcon from "../../assets/icons/enrolledCourses.svg";

const AssignedBatchCard = ({
  programName,
  batchCode,
  campus,
  academicYear,
  level,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const base = "headTeacher.assignedBatches.batchCard";

  const infoRows = [
    { icon: batchIcon,    label: `${t(`${base}.batch`)}: ${batchCode}`  },
    { icon: locationIcon, label: campus                                   },
    { icon: calendarIcon, label: academicYear                             },
    { icon: levelIcon,    label: `${t(`${base}.level`)}: ${level}`       },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid #F5F5F5",
        boxShadow: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Top Icon Box */}
      <Box
        sx={{
          backgroundColor: "primary.lightGray",
          borderRadius: "10px",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={programIcon} alt="program" style={{ width: 20, height: 20 }} />
      </Box>

      {/* Program Title */}
      <Typography
        fontSize="22px"
        fontWeight={700}
        color="text.primary"
        lineHeight={1.3}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {programName}
      </Typography>

      {/* Info Grid - 2 columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 12px",
        }}
      >
        {infoRows.map((row, index) => (
          <Box key={index} display="flex" alignItems="center" gap={0.75}>
            <img
              src={row.icon}
              alt=""
              style={{ width: 14, height: 14, flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* View Details Button */}
      <CustomButton
        btnLabel={t(`${base}.viewDetails`)}
        handlePressBtn={onViewDetails}
        variant="courseCard"
        sx={{ mt: "auto" }}
      />
    </Box>
  );
};

export default AssignedBatchCard;