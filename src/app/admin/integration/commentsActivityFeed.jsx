import { Box, Typography, Avatar } from "@mui/material";
import { Link } from "lucide-react";
import DateIcon from "../../../assets/icons/date-icon.svg";

const CommentsActivityFeed = ({ comments = [] }) => {
  return (
    <Box>
      <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={2}>
        Comments Activity Feed
      </Typography>

      <Box display="flex" flexDirection="column" gap={1.5}>
        {comments.map((comment) => (
          <Box
            key={comment.id}
            sx={{
              backgroundColor: "#F5F5F5",
              borderRadius: "14px",
              px: 2.5,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #F5F5F5",
            }}
          >
            {/* Left — title + author */}
            <Box>
              <Typography fontSize="13px" fontWeight={600} color="text.primary" mb={0.75}>
                {comment.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={comment.avatar}
                  alt={comment.author}
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: "10px",
                    background: "linear-gradient(135deg, #AA2493, #022179)",
                  }}
                >
                  {comment.author?.charAt(0)}
                </Avatar>
                <Typography fontSize="11px" color="text.secondary">
                  {comment.author}
                </Typography>
                <Box
                 
                />
                <img src={DateIcon} alt="date" style={{ width: 12, height: 12 }} />
                <Typography fontSize="11px" color="text.secondary">
                  {comment.date}
                </Typography>
              </Box>
            </Box>

            {/* Right — where to find link */}
            <Box display="flex" alignItems="center" gap={0.5} sx={{ flexShrink: 0, ml: 2 }}>
              <Typography fontSize="11px" color="text.secondary">
                Where to find this?
              </Typography>
              <Link size={12} color="#67768B" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommentsActivityFeed;