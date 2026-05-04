import { Box } from "@mui/material";

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F4F4F4",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        "&::before": {
          content: '""',
          position: "absolute",
          width: "1000px",
          height: "1000px",
          bottom: "-500px",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(251, 214, 4, 0.8) 0%, rgba(239, 83, 34, 0.8) 100%)",
          filter: "blur(180px)",
          zIndex: 0,
        },

        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;