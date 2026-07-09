// app/auth/components/authLayout.jsx
import { Box, Typography } from "@mui/material";
import LogoIcon from "../../assets/icons/softflux-logo.svg";

const AuthLayout = ({ children }) => (
  <Box
    sx={{
      position:        "fixed",
      inset:           0,
      display:         "flex",
      flexDirection:   { xs: "column", md: "row" },
      backgroundColor: "#fff",
      zIndex:          1200,
      overflowY:       "auto",
    }}
  >
    {/* ── Left/Top gradient panel ── */}
    <Box
      sx={{
        width:        { xs: "100%", md: "42%" },
        flexShrink:   0,
        p:            { xs: 2, md: 3 },           // outer spacing from edges
        minHeight:    { xs: "auto", md: "100vh" },
        display:      "flex",
      }}
    >
      <Box
        sx={{
          flex:           1,
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
          background:     "linear-gradient(135deg, #022179 0%, #AA2493 100%)",
          borderRadius:   "20px",
          p:              { xs: 3, md: 4 },
          minHeight:      { xs: 200, md: "auto" },
        }}
      >
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1}>
          <img src={LogoIcon} alt="Software Flux" style={{ height: 28 }} />
        </Box>

        {/* Tagline */}
        <Typography
          fontWeight={700}
          color="#fff"
          lineHeight={1.2}
          sx={{ fontSize: { xs: "28px", md: "42px" } }}
        >
          We Will Develop Your Desire
        </Typography>
      </Box>
    </Box>

    {/* ── Right/Bottom content panel ── */}
    <Box
      sx={{
        flex:           1,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        p:              { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;