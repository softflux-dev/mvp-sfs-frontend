import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import { getStatusColor } from "../../utils/statusColors";
const TicketCard = ({
  priority = "Medium",
  title = "Printer Issue",
  description = "Main HR printer offline.",
  date = "2024-02-28",
  status = "Open",
}) => {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box p={2}>
        {/* Priority & Date */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={priority}
            sx={{
              color: getStatusColor("ticketPriority", priority).color,
              backgroundColor: getStatusColor("ticketPriority", priority)
                .backgroundColor,
              height: "24px",
              fontSize: "10px",
            }}
          />

          <Typography fontSize={12} color="text.secondary">
            {date}
          </Typography>
        </Stack>

        {/* Title */}
        <Box display="flex" flexDirection="column" gap={0} my={1}>
          <Typography
            variant="primaryText"
            fontSize={12}
            fontWeight={600}
            color="text.primary"
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography variant="captionText" color="text.secondary">
            {description}
          </Typography>
        </Box>

        {/* Status */}
        <Box
          display="flex"
          justifyContent="flex-end"
          borderTop="1px solid"
          borderColor="divider"
          pt={1}
        >
          <Typography
            variant="secondaryText"
            fontWeight={600}
            fontSize={12}
            color="primary.main"
          >
            Status: {status}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default TicketCard;
