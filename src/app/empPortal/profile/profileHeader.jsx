import { useRef } from "react";
import { Box, Typography, Chip, Avatar, IconButton } from "@mui/material";
import UploadIcon from "../../../assets/icons/upload-img.svg";
import { baseUrl } from "../../../api/index";

// baseUrl already ends with "/api/" (e.g. "http://localhost:5000/api/")
// — strip that off to get the bare backend origin for static file URLs.
const getBackendOrigin = () => baseUrl.replace(/\/api\/?$/, "");

// The backend stores avatar as a RELATIVE path (e.g. "/uploads/xyz.png").
// This must be prefixed with the backend's actual domain before being used
// as an <Avatar src>, otherwise the browser tries to load it from the
// frontend's own origin (localhost:5173) instead of the backend
// (localhost:5000) and silently fails to render.
const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http") || avatarUrl.startsWith("blob:")) return avatarUrl;
  return `${getBackendOrigin()}${avatarUrl}`;
};

const ProfileHeader = ({ profile = {}, onAvatarChange }) => {
  const fileInputRef = useRef(null);

  if (!profile) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) onAvatarChange(file);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: "20px 24px", mb: 3 }}>
      <Box display="flex" justifyContent="flex-end" mb={1}>

      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
          <Avatar
            src={resolveAvatarUrl(profile.avatar)}
            alt={profile.name}
            sx={{
              width: 72, height: 72,
              fontSize: "24px", fontWeight: 700,
            }}
          >
            {profile.name?.charAt(0) || "U"}
          </Avatar>

          <IconButton
            onClick={() => fileInputRef.current?.click()}
            sx={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28,
              backgroundColor: "#fff", border: "1px solid #E0E0E0", p: 0,
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <img src={UploadIcon} alt="upload" style={{ width: 16, height: 16 }} />
          </IconButton>

          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Box>

        <Box>
          <Typography fontSize="22px" fontWeight={700} color="text.primary" mb={0.25}>
            {profile.name || "—"}
          </Typography>

          {/* role · department — using role instead of designation */}
          <Typography fontSize="13px" color="text.secondary" mb={0.75}>
            {[profile.role, profile.department].filter(Boolean).join(" · ")}
          </Typography>

          <Chip
            label={profile.empId || "—"}
            sx={{
              height: "22px", fontSize: "11px", fontWeight: 500,
              borderRadius: "6px", backgroundColor: "#F5F5F5", color: "text.secondary",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileHeader;