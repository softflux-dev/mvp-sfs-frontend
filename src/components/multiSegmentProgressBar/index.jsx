import { Box } from "@mui/material";

const MultiSegmentProgressBar = ({
  segments = [],
  height = 8,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: height,
        borderRadius: `${height / 2}px`,
        overflow: "hidden",
        backgroundColor: "primary.lightGray",
      }}
    >
      {segments.map((segment, index) => (
        segment.percentage > 0 && (
          <Box
            key={index}
            sx={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color,
            }}
          />
        )
      ))}
    </Box>
  );
};

export default MultiSegmentProgressBar;