import { Box, Typography, Chip, Avatar, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import InfoRow from "../../../src/app/academic/studentHub/studentProfile/personal/infoRow";
import CustomButton from "../customButton";
import EditIcon from "@mui/icons-material/Edit";

const GuardianCard = ({ guardian, role, onEdit }) => {
  const { t } = useTranslation();
  const base = "academicManagement.studentHub.studentProfile.guardian";

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", p: 3, border: "1px solid #F3F4F6", display: "flex", flexDirection: "column" }}>
      {/* Header — Avatar + Name + Role chip */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: role === "father" ? "#FEF3C7" : "#FCE7F3",
              color: role === "father" ? "#F59E0B" : "#EC4899",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {guardian?.name?.charAt(0) || "?"}
          </Avatar>
          <Box>
            <Typography fontSize={15} fontWeight={700} color="#111827">
              {guardian?.name || (role === "father" ? "Al-Rashid Ahmed" : "Sarah Al-Mohsen")}
            </Typography>
            <Typography fontSize={13} color="#6B7280">
              {guardian?.nameAr || (role === "father" ? "أحمد الراشد" : "سارة المحسن")}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={
            role === "father"
              ? t(`${base}.father`)
              : role === "mother"
              ? t(`${base}.mother`)
              : guardian?.relationship || role
          }
          sx={{ height: 24, fontSize: 12, fontWeight: 600, bgcolor: "#F3F4F6", color: "#374151", borderRadius: "6px" }}
        />
      </Box>

      <Divider sx={{ borderColor: "#F3F4F6", mb: 1 }} />

      {/* National ID + Nationality in a row */}
      <Box display="flex" gap={4} py={1.5}>
        <Box>
          <Typography fontSize={13} color="#6B7280" mb={0.5}>{t(`${base}.nationalId`)}</Typography>
          <Typography fontSize={14} fontWeight={600} color="#111827">
            {guardian?.nationalId || (role === "father" ? "1234567890" : "0987654321")}
          </Typography>
        </Box>
        <Box>
          <Typography fontSize={13} color="#6B7280" mb={0.5}>{t(`${base}.nationality`)}</Typography>
          <Typography fontSize={14} fontWeight={600} color="#111827">
            {guardian?.nationality || t(`${base}.saudi`)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#F3F4F6" }} />

      {/* Occupation */}
      <InfoRow
        icon={<WorkOutlineIcon sx={{ fontSize: 16 }} />}
        label={t(`${base}.occupation`)}
        value={guardian?.occupation || t(`${base}.${role === "father" ? "engineer" : "teacher"}`)}
      />

      {/* Contact Information header */}
      <Typography fontSize={13} fontWeight={600} color="#111827" mt={0.5} mb={1}>
        {t(`${base}.contactInformation`)}
      </Typography>

      {/* Phone */}
      <InfoRow
        icon={<PhoneIcon sx={{ fontSize: 16 }} />}
        value={guardian?.phone || (role === "father" ? "+966501234567" : "+966509876543")}
      />

      {/* WhatsApp */}
      <InfoRow
        icon={<WhatsAppIcon sx={{ fontSize: 16, color: "#16A34A" }} />}
        valueNode={
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={t(`${base}.whatsapp`)} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: "#DCFCE7", color: "#16A34A", borderRadius: "6px" }} />
            <Typography fontSize={14} fontWeight={600} color="#111827">
              {guardian?.whatsapp || guardian?.phone || (role === "father" ? "+966501234567" : "+966509876543")}
            </Typography>
          </Box>
        }
      />

      {/* Email */}
      <InfoRow
        icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />}
        value={guardian?.email || (role === "father" ? "father@example.com" : "mother@example.com")}
        showDivider={false}
      />

      {/* Edit Guardian button */}
      <Box mt="auto" pt={2.5}>
        <Divider sx={{ borderColor: "#F3F4F6", mb: 2 }} />
        <CustomButton
          btnLabel={t(`${base}.editGuardian`)}
          variant="customGray"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
          handlePressBtn={() => onEdit && onEdit(guardian, role)}
          sx={{ width: "100%", fontWeight: 600 }}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default GuardianCard;