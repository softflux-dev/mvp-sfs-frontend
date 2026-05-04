import { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import logoutIcon from "../../assets/icons/logout-red.svg";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../zustand/useUserStore";

export default function Profile({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { clearUserData } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    //clearUserData();
    //navigate("/login");
  };

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
          src={
            user?.profilePicture ||
            "https://i.pinimg.com/736x/36/83/32/3683323f88954ae8c498f8a8bec7272b.jpg"
          }
        />
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
              border: "3px solid #AA2493"
            }}
            src={
              user?.profilePicture ||
              "https://i.pinimg.com/736x/36/83/32/3683323f88954ae8c498f8a8bec7272b.jpg"
            }
          />

          <Typography fontSize="20px" fontWeight="600" mb="0.5">
            {user?.fullName || "User Name"}
          </Typography>

          <Typography fontSize="14px" color="#666" mb="3">
            {user?.email || "user@email.com"}
          </Typography>

          <Stack direction="column" gap={1} width="100%" mt={3}>
            {/* LOGOUT */}
            <Box
              onClick={handleLogout}
              width="100%"
              display="flex"
              alignItems="center"
              gap={1}
              borderRadius="16px"
              p="12px 18px"
              sx={{
                cursor: "pointer",
              }}
            >
              <img src={logoutIcon} alt="icon" width={20} height={20} />

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