import { StrictMode, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material/styles";
import getTheme from "./theme";
import { CssBaseline } from "@mui/material";
import { ErrorDialogProvider } from "./lib/context/errorDialogContext.jsx";
import { SuccessDialogProvider } from "./lib/context/successDialogContext.jsx";


const theme = getTheme("ltr");
function AppWithTheme() {
  return (
    <ErrorDialogProvider>
      <SuccessDialogProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </SuccessDialogProvider>
    </ErrorDialogProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWithTheme />
  </StrictMode>
);
