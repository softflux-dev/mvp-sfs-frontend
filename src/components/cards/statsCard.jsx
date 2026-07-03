// src/components/cards/statsCard.jsx — 
import { useState } from "react";
import { Box, Typography } from "@mui/material";

const StatsCard = ({
  title,
  value,
  icon,
  iconHover,
  isHighlighted = false,
  subtitle,
  subtitleIcon,
  subtitleColor,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const active = isHighlighted || hovered;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        backgroundColor: "#fff",
        borderRadius: "30px",
        p: 2,
        height: "100%",
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        background: active
          ? "linear-gradient(135deg, #AA2493 0%, #022179 100%)"
          : "#fff",
        boxShadow: active
          ? "0 8px 24px rgba(170, 36, 147, 0.25)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Top row — icon + title */}
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            backgroundColor: active ? "rgba(255,255,255,0.2)" : "#F5F5F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background-color 0.3s ease",
          }}
        >
          <img
            src={active && iconHover ? iconHover : icon}
            alt={title}
            style={{
              width: 20,
              height: 20,
              objectFit: "contain",
              filter: active && !iconHover ? "brightness(0) invert(1)" : "none",
              transition: "filter 0.3s ease",
            }}
          />
        </Box>

        <Typography
          fontSize="13px"
          fontWeight={500}
          color={active ? "#fff" : "text.secondary"}
          sx={{ transition: "color 0.3s ease", lineHeight: 1.3 }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value */}
      <Typography
        fontSize="28px"
        fontWeight={700}
        color={active ? "#fff" : "text.primary"}
        sx={{ transition: "color 0.3s ease", lineHeight: 1.2, mb: 0.5 }}
      >
        {value}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Box display="flex" alignItems="center" gap={0.5}>
          {subtitleIcon && (
            <img
              src={subtitleIcon}
              alt=""
              style={{
                width: 14,
                height: 14,
                filter: active ? "brightness(0) invert(1)" : "none",
                transition: "filter 0.3s ease",
              }}
            />
          )}
          <Typography
            fontSize="12px"
            color={active ? "rgba(255,255,255,0.8)" : subtitleColor || "text.secondary"}
            sx={{ transition: "color 0.3s ease" }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatsCard;