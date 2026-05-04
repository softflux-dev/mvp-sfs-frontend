import { Card, CardContent, Typography, Box, Stack, Chip, IconButton } from "@mui/material";
import moment from "moment/moment";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";

const getDisplayText = (val, lang = "en") => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || val.ar || "";
};

const AnnouncementCard = ({ announcement, onDelete, showDelete = true }) => {
  console.log("announcement", announcement);

  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const title = getDisplayText(announcement.title, lang);
  const content = getDisplayText(announcement.content, lang);

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        borderRadius: "18px",
        boxShadow: "none",
        backgroundColor: "#fff",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          {/* ===== LEFT CONTENT ===== */}
          <Box flex={1}>
            {/* 🔹 Title */}
            <Typography
              fontSize={13}
              fontWeight={600}
              color="text.primary"
              mb={0.5}
            >
              {title}
            </Typography>

            {/* 🔹 Meta info */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              mb={1.5}
            >
              {/* <Typography variant="captionText" color="text.secondary">
                {moment(announcement.createdAt).format("DD/MM/YYYY") ||
                  moment().format("DD/MM/YYYY HH:mm")}
              </Typography> */}
              <Typography variant="captionText" color="text.secondary">
                {/* • By {getDisplayText(announcement.author, lang) || "Admin"}
                 */}
                {announcement?.employeeGroupId?.groupName}
              </Typography>
              <Typography variant="captionText" color="text.secondary">
                {announcement?.branchId?.name?.en}
              </Typography>
            </Stack>

            {/* 🔹 Description LAST */}
            <Typography fontSize={12} color="text.secondary">
              {content}
            </Typography>
          </Box>

          {/* ===== RIGHT CHIP ===== */}
          {/* <Chip
            label={getDisplayText(announcement.priority, lang) || "NORMAL"}
            size="small"
            variant="mainChip"
          /> */}
          {showDelete && onDelete && (
            <IconButton onClick={() => onDelete?.(announcement._id)} size="small">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
