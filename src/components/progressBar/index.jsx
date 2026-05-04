import { Box, Typography, LinearProgress } from "@mui/material";

const ProgressBar = ({
  label,
  value,
  percentage,
  showPercentage = true,
  height = 6,
  gradientBg =  "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
   sx = {},
}) => {
  return (
     <Box mb={label || showPercentage ? 2 : 0} {...sx}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography

          variant="caption"
          color="text.light"
          fontWeight={"500"}
          fontSize={"0.75rem"}

        >
          {label}
        </Typography>
        {showPercentage && (
          <Typography
            variant="caption"
            color="text.light"
            fontWeight={"500"}
            fontSize={"0.75rem"}
          >
            {percentage || `${value}%`}
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: height,
          borderRadius: 3,
          backgroundColor: "primary.lightGray",
          "& .MuiLinearProgress-bar": {
            background: gradientBg,
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

export default ProgressBar;