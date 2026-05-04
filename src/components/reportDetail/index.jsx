import { Box, Grid, Typography } from "@mui/material";

const ReportDetails = ({ fields }) => {
  const InfoItem = ({ label, value }) => (
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Typography fontSize={12} color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>{value || "-"}</Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        margin: "10px 0",
      }}
    >
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <InfoItem label={field.label} value={field.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportDetails;