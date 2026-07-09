// components/appBar/profile.jsx — FULL REPLACEMENT
import { useState, useEffect } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import logoutIcon  from "../../assets/icons/logout-red.svg";
import personIcon  from "../../assets/icons/profile-active.svg";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../zustand/useUserStore";
import { useCompanyLogoStore } from "../../zustand/useCompanyLogoStore";
import { getCompanyProfileApi } from "../../api/modules/companySettings";
import { baseUrl } from "../../api/index";

const getBackendOrigin = () => baseUrl.replace(/\/api\/?$/, "");
const resolveFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${getBackendOrigin()}${path}`;
};

export default function Profile() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, clearUserData } = useUserStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";

  // ── Admin: company logo instead of a personal photo ──────────────────────
  const companyLogo    = useCompanyLogoStore((state) => state.logoUrl);
  const setCompanyLogo = useCompanyLogoStore((state) => state.setLogoUrl);

  useEffect(() => {
    if (!isAdmin || companyLogo) return;
    (async () => {
      try {
        const res = await getCompanyProfileApi();
        if (res?.status === 200 || res?.status === 201) {
          const rawLogoUrl = res.data.data.profile?.logoUrl || "";
          setCompanyLogo(resolveFileUrl(rawLogoUrl));
        }
      } catch {
        // Non-fatal — falls back to the default avatar below
      }
    })();
  }, [isAdmin, companyLogo, setCompanyLogo]);

  const handleLogout = () => {
    clearUserData();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate("/profile");
  };

  // What to actually show:
  //   Admin              → company logo (live) → fallback to their own avatar
  //   HR / PM / Employee → user.avatar from useUserStore, which the Profile
  //                          page now keeps in sync on every save (name,
  //                          avatar, etc.) — see profile/index.jsx's
  //                          syncUserStore(). No separate fetch/store needed
  //                          here anymore; this is the single source of truth.
  const displaySrc = isAdmin
    ? (companyLogo || resolveFileUrl(user?.avatar) || user?.profilePicture)
    : (resolveFileUrl(user?.avatar) || user?.profilePicture);

  return (
    <>
     {/* AVATAR BUTTON */}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            cursor: "pointer",
            border: "2px solid #AA2493",
          }}
          src={displaySrc}
        >
          {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
      </IconButton>

      {/* PROFILE MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            minWidth: 320,
            p: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
         <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: "3px solid #AA2493",
            }}
            src={displaySrc}
          >
            {(user?.fullName || user?.name)?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>

          <Typography fontSize="20px" fontWeight="600" mb={0.5}>
            {user?.fullName || user?.name || "User Name"}
          </Typography>

          <Typography fontSize="14px" color="#666" mb={3}>
            {user?.email || "user@email.com"}
          </Typography>

          <Stack direction="column" gap={1} width="100%" mt={3}>
            {/* PROFILE BUTTON */}
            <Box
              onClick={handleProfileClick}
              width="100%"
              display="flex"
              alignItems="center"
              gap={1}
              borderRadius="16px"
              p="12px 18px"
              sx={{
                cursor: "pointer",
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
                },
              }}
            >
              <img src={personIcon} alt="profile" width={20} height={20} />
              <Typography fontSize="16px" fontWeight="400" color="#fff">
                Profile
              </Typography>
            </Box>

            {/* LOGOUT */}
            <Box
              onClick={handleLogout}
              width="100%"
              display="flex"
              alignItems="center"
              gap={1}
              borderRadius="16px"
              p="12px 18px"
              sx={{ cursor: "pointer" }}
            >
              <img src={logoutIcon} alt="logout" width={20} height={20} />
              <Typography fontSize="16px" fontWeight="400" color="error.main">
                Log out
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Menu>
    </>
  );
}