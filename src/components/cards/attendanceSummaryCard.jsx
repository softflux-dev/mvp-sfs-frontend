import { Box, Typography } from "@mui/material";

/**
 * AttendanceSummaryCard
 * ─────────────────────
 * Props:
 *   label    – string  e.g. "Present Days"
 *   value    – string | number
 *   icon     – img src  (your SVG asset)
 *   iconBg   – hex string for icon background  default "#04C3731A"
 *   iconColor– hex string for icon tint        default "#04C373"
 */
const AttendanceSummaryCard = ({
  label,
  value,
  icon,
  iconBg    = "#04C3731A",
  iconColor = "#04C373",
}) => (
  <Box
    sx={{
      display:       "flex",
      alignItems:    "center",
      gap:           1.5,
      bgcolor:       "#F5F5F5",
      borderRadius:  "16px",
      p:             "14px 16px",
    }}
  >
    <Box
      sx={{
        width:         40,
        height:        40,
        borderRadius:  "10px",
        bgcolor:       iconBg,
        display:       "flex",
        alignItems:    "center",
        justifyContent:"center",
        flexShrink:    0,
      }}
    >
      <img
        src={icon}
        alt={label}
        style={{ width: 20, height: 20, filter: `drop-shadow(0 0 0px ${iconColor})` }}
      />
    </Box>

    <Box>
      <Typography fontSize="20px" fontWeight={700} color="text.primary" lineHeight={1}>
        {value}
      </Typography>
      <Typography fontSize="11px" fontWeight={400} color="text.secondary" mt="2px">
        {label}
      </Typography>
    </Box>
  </Box>
);

export default AttendanceSummaryCard;