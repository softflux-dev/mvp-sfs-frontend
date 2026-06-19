import { useState } from "react";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";

import HeaderText     from "../../../components/headerText";
import CustomTabs     from "../../../components/tabs";
import ProfileHeader  from "./profileHeader";
import PersonalTab    from "./tabs/personalTab";
import SecurityTab    from "./tabs/securityTab";
import { useProfile } from "../../../hooks/profile";
import useUserStore   from "../../../zustand/useUserStore";

const tabs = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Security" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(1);
  const setUserData = useUserStore((state) => state.setUserData);
  const currentUser  = useUserStore((state) => state.user);

  const {
    profile,
    loading,
    actionLoading,
    error,
    updateProfile,
    changePassword,
  } = useProfile();

  // ── Normalize API shape → component shape ─────────────────────────────
  const normalized = profile ? {
    name:         profile.fullName         || "—",
    avatar:       profile.avatar           || "",
    role:         profile.role?.roleName   || "—",
    department:   profile.department?.name || "—",
    empId:        profile.empId            || "—",
    email:        profile.email            || "—",
    phone:        profile.phone            || "",
    joiningDate:  profile.joiningDate
      ? new Date(profile.joiningDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    empType:      profile.employmentType   || "—",
    workingHours: profile.workingHours
      ? `${profile.workingHours} hours`
      : "—",
  } : null;

  // ── Sync ANY profile update (name, avatar, phone, etc.) into the global
  // user store — this is what the topbar dropdown (appBar/profile.jsx)
  // actually reads from. Without this, editing your name or uploading a
  // new avatar updates this page correctly but the topbar stays stale
  // until the next full login.
  const syncUserStore = (updatedProfile) => {
    if (!updatedProfile) return;
    setUserData({
      ...currentUser,
      fullName: updatedProfile.fullName ?? currentUser?.fullName,
      name:     updatedProfile.fullName ?? currentUser?.name,
      avatar:   updatedProfile.avatar   ?? currentUser?.avatar,
      email:    updatedProfile.email    ?? currentUser?.email,
      phone:    updatedProfile.phone    ?? currentUser?.phone,
    });
  };

  const handleAvatarChange = async (file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const result = await updateProfile(fd);
    if (result?.success) syncUserStore(result.profile);
  };

  const handlePersonalSave = async (formData) => {
    const result = await updateProfile(formData);
    if (result?.success) syncUserStore(result.profile);
    return result;
  };

  return (
    <Box>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText title="Profile" subtitle="Configure system preferences" />
        </Grid>
      </Grid>

      {error && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={32} sx={{ color: "#AA2493" }} />
        </Box>
      ) : (
        <>
          <ProfileHeader
            profile={normalized}
            onAvatarChange={handleAvatarChange}
          />

          <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <Box mt={2}>
            {activeTab === 1 && (
              <PersonalTab
                profile={normalized}
                loading={actionLoading}
                onSave={handlePersonalSave}
              />
            )}
            {activeTab === 2 && (
              <SecurityTab
                loading={actionLoading}
                onSave={changePassword}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Profile;