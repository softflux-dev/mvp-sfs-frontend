import { Box, Typography, Avatar } from "@mui/material";
import { Mail, Phone } from "lucide-react";
import StarIcon from "@mui/icons-material/Star";

const InstructorCard = ({ name, role, email, phone, avatar, skills }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0px 1px 5px rgba(0,0,0,0.1)",
        minWidth: 250,
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Avatar
          src={avatar}
          alt={name}
          sx={{
            width: 60,
            height: 60,
            background: "linear-gradient(126.79deg, #FBD604 -5.59%, #EF5322 101.32%)",
          }}
        >
          {name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontSize="16px" fontWeight={600} color="text.primary">
            {name}
          </Typography>
          <Typography fontSize="14px" color="text.secondary">
            {role}
          </Typography>
        </Box>
      </Box>

      {(email || phone) && (
        <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
          {email && (
            <Box display="flex" alignItems="center" gap={1}>
              <Mail size={16} color="#67768B" />
              <Typography variant="body2">{email}</Typography>
            </Box>
          )}
          {phone && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone size={16} color="#67768B" />
              <Typography variant="body2">{phone}</Typography>
            </Box>
          )}
        </Box>
      )}

      {skills && skills.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {skills.map((skill) => (
            <Box
              key={skill.name}
              display="flex"
              alignItems="center"
              gap={0.5}
              px={1}
              py={0.5}
              borderRadius={1}
              bgcolor="#F973161A"
            >
              <Typography fontSize={12} fontWeight={500} color="#F97316">
                {skill.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.2}>
                <StarIcon sx={{ fontSize: 12, color: "#F97316" }} />
                <Typography fontSize={12} fontWeight={500} color="#F97316">
                  {skill.rating}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default InstructorCard;
