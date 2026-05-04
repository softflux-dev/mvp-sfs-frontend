import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";

const SecondaryStatsCard = ({ title, value, subtitle, footer, icon, highlight }) => {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        height: "100%",
        border: highlight ? "1px solid #ffcccc" : "1px solid #eee",
        boxShadow: "none",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize="15px" fontWeight={500} color="text.black">
            {title}
          </Typography>
          <IconButton
            sx={{
              backgroundColor: "primary.lightGray",
              borderRadius: "10px",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >{icon}</IconButton>
        </Box>

        <Typography variant="h4" fontWeight={600} mt={1}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.black" mt={0.5}>
            {subtitle}
          </Typography>
        )}

        {footer && (
          <Typography
            variant="body2"
            mt={1}
            color={footer?.color || "text.black"}
          >
            {footer?.text}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SecondaryStatsCard;
