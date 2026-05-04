// employees/employeeDetailTabs/personalInfoTab.jsx
import { Box, Grid, Typography } from "@mui/material";

const InfoField = ({ label, value }) => (
  <Box>
    <Typography fontSize="11px" color="text.secondary" fontWeight={500} mb={0.3}>
      {label}
    </Typography>
    <Typography fontSize="14px" fontWeight={700} color="text.primary">
      {value || "—"}
    </Typography>
  </Box>
);

const PersonalInfoTab = ({ employee = {} }) => {
  const fields = [
    { label: "Email",              value: employee.email          },
    { label: "Phone",              value: employee.phone          },
    { label: "Department",         value: employee.department     },
    { label: "Designation",        value: employee.designation    },
    { label: "Role",               value: employee.role           },
    { label: "Employment Type",    value: employee.type           },
    { label: "Working Hours/Day",  value: employee.workingHours ? `${employee.workingHours} hours` : null },
    { label: "Joining Date",       value: employee.joiningDate    },
  ];

  return (
    <Box sx={{ mt: 2, bgcolor: "#fff", borderRadius: "16px", p: 3 }}>
      <Grid container spacing={3}>
        {fields.map((f) => (
          <Grid item size={{ xs: 12, sm: 4 }} key={f.label}>
            <InfoField label={f.label} value={f.value} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonalInfoTab;