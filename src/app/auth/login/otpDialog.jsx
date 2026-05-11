// app/auth/login/otpDialog.jsx
import { useState } from "react";
import {
  Box, Typography, Dialog, DialogContent,
  Link, CircularProgress,
} from "@mui/material";
import CustomButton from "../../../components/customButton";

const OtpDialog = ({ open, onClose, onVerify, apiError = "", loading = false, onResend }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const next   = [...otp];
    pasted.forEach((char, i) => { if (/\d/.test(char)) next[i] = char; });
    setOtp(next);
  };

  const handleVerify = () => {
    onVerify(otp.join(""));
  };

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}
      PaperProps={{ sx: { borderRadius: "20px", p: 3, minWidth: 360, maxWidth: 420 } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Typography fontSize="20px" fontWeight={600} color="text.primary"
          textAlign="center" mb={3}
        >
          Enter OTP Code
        </Typography>

        <Box display="flex" justifyContent="center" gap={1.5} mb={2} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <Box key={i} id={`otp-${i}`} component="input"
              inputMode="numeric" maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              sx={{
                width: "48px", height: "56px", textAlign: "center",
                fontSize: "20px", fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                border: "1.5px solid #E0E0E0", borderRadius: "12px",
                outline: "none", color: "#030229", backgroundColor: "#fff",
                transition: "border-color 0.2s",
                "&:focus": { borderColor: "#AA2493" },
              }}
            />
          ))}
        </Box>

        {/* API error */}
        {apiError && (
          <Box mb={2} px={2} py={1}
            sx={{ backgroundColor: "#FFF0F0", borderRadius: "8px", border: "1px solid #FFCCCC" }}
          >
            <Typography fontSize={13} color="error" textAlign="center">{apiError}</Typography>
          </Box>
        )}

        <Box textAlign="center" mb={3}>
          <Link component="button" fontSize="13px" color="text.secondary"
            underline="hover" onClick={onResend}
            sx={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Resend Code
          </Link>
        </Box>

        <CustomButton
          btnLabel={loading
            ? <CircularProgress size={20} sx={{ color: "#fff" }} />
            : "Verify Code"
          }
          variant="authbutton"
          handlePressBtn={handleVerify}
          fullWidth sx={{ width: "100%" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OtpDialog;