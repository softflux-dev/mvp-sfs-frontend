// components/cards/statsCard.jsx — full file replacement
import { Box, Chip, Typography } from "@mui/material";
import ProgressBar from "../progressBar";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StatsCard = ({ title, value, description, icon, changePercentage, onClick, isSelected = false, isHighlighted = false, restrictedAccess, progress, validationStatus, valueFontSize, titleFontSize, valueFontWeight }) => {
  const hasChipsLayout = restrictedAccess && restrictedAccess.length > 0;
  const highlighted = isSelected || isHighlighted;

  return (
    <Box
      onClick={onClick}
      sx={{
        background: highlighted ? "linear-gradient(90deg, #AA2493 0%, #022179 100%)" : "#fff",
        borderRadius: "30px",
        color: highlighted ? "#fff" : "#000",
        height: "100%",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        border: onClick ? "1px solid #AA2493" : "none",
        boxShadow: "none",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(170, 36, 147, 0.15)",
          background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
          "& .stats-text": { color: "#fff" },
          "& .stats-icon-box": { backgroundColor: "rgba(255,255,255,0.2)" },
        },
      }}
    >
      {/* Icon and Title */}
      <Box display="flex" alignItems="center" gap={2}>
        {icon && !hasChipsLayout && (
          <Box
            className="stats-icon-box"
            sx={{
              backgroundColor: highlighted ? "rgba(255,255,255,0.2)" : "#F5F5F5",
              borderRadius: "10px",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {typeof icon === "string" ? (
              <img src={icon} alt={title} style={{ width: 20, height: 20 }} />
            ) : (
              icon
            )}
          </Box>
        )}
        <Typography
          className="stats-text"
          fontSize={titleFontSize || "14px"}
          fontWeight={600}
          color={highlighted ? "#fff" : "#000"}
        >
          {title}
        </Typography>
      </Box>

      {/* Value */}
      {!hasChipsLayout && (
        <Typography
          className="stats-text"
          fontSize={valueFontSize || "28px"}
          fontWeight={valueFontWeight || 700}
          color={highlighted ? "#fff" : "#000"}
          lineHeight={1}
          mt={1}
        >
          {value}
        </Typography>
      )}

      {/* Chips layout */}
      {hasChipsLayout && (
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt={0.5}>
          <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
            {restrictedAccess.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                size="small"
                variant={item.variant || "filled"}
                sx={{
                  ...(item.bg && {
                    backgroundColor: item.bg,
                    color: "#fff",
                    "& .MuiChip-label": { color: "#fff" },
                  }),
                }}
                color={!item.bg ? (item.color || "default") : undefined}
              />
            ))}
          </Box>
          {icon && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {typeof icon === "string" ? (
                <img src={icon} alt={title} style={{ width: 20, height: 20 }} />
              ) : icon}
            </Box>
          )}
        </Box>
      )}

      {/* Description + change percentage */}
      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
        {changePercentage && (
          <Typography
            fontSize="12px"
            fontWeight={500}
            sx={{ color: highlighted ? "#fff" : "#4CAF50" }}
          >
            ▲ {changePercentage}
          </Typography>
        )}
        {description && (
          <Typography
            className="stats-text"
            fontSize="12px"
            fontWeight={400}
            sx={{ color: highlighted ? "rgba(255,255,255,0.8)" : "text.disabled" }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {progress && <ProgressBar value={progress} />}

      {validationStatus && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <CheckCircleIcon fontSize="12px" style={{ color: "#04C373" }} />
          <Typography fontSize="12px" fontWeight={400} color="primary.main">
            {validationStatus}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatsCard;