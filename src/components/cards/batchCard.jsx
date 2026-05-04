// import { Box, Typography, Chip } from "@mui/material";
// import { Groups, TrendingUp } from "@mui/icons-material";
// import ProgressBar from "../progressBar";

// const BatchCard = ({
//   batchName,
//   batchCode,
//   status,
//   shift,
//   currentStudents,
//   totalStudents,
//   gpa,
//   completionPercentage,
//   program,
//   gradientBg = "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
// }) => {
//   return (
//     <Box
//       sx={{
//         backgroundColor: "#fff",
//         borderRadius: "12px",
//         padding: "20px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 2,
//         boxShadow: "none",
//         border: "1px solid #F5F5F5",
//         transition: "all 0.3s ease",
//         height: "100%",
//         "&:hover": {
//           transform: "translateY(-4px)",
//           border: "1px solid #E0E0E0",
//         },
//       }}
//     >
//       {/* Header with Status and Shift */}
//       <Box display="flex" alignItems="center" justifyContent="space-between">
//         <Chip
//           label={status}
//           sx={{
//             height: "24px",
//             fontSize: "12px",
//             fontWeight: 600,
//             backgroundColor: "#F97316",
//             color: "#fff",
//             "& .MuiChip-label": {
//               padding: "0 12px",
//             },
//           }}
//         />
//         <Typography fontSize="12px" fontWeight={500} color="text.secondary">
//           {shift}
//         </Typography>
//       </Box>

//       {/* Batch Name */}
//       <Box>
//         <Typography
//           fontSize="20px"
//           fontWeight={600}
//           color="text.primary"
//           mb={0.5}
//           sx={{
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             display: "-webkit-box",
//             WebkitLineClamp: 1,
//             WebkitBoxOrient: "vertical",
//           }}
//         >
//           {batchName}
//         </Typography>
//         <Typography
//           fontSize="12px"
//           fontWeight={400}
//           color="text.secondary"
//           sx={{
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             display: "-webkit-box",
//             WebkitLineClamp: 1,
//             WebkitBoxOrient: "vertical",
//           }}
//         >
//           {batchCode}
//         </Typography>
//       </Box>

//       {/* Stats Row - Students and GPA */}
//       <Box display="flex" alignItems="center" justifyContent="space-between">
//         <Box display="flex" alignItems="center" gap={0.5}>
//           <Groups sx={{ color: "text.secondary", fontSize: 18 }} />
//           <Typography fontSize="14px" fontWeight={500} color="text.primary">
//             {currentStudents}/{totalStudents}
//           </Typography>
//         </Box>
//         <Box display="flex" alignItems="center" gap={0.5}>
//           <TrendingUp sx={{ color: "text.secondary", fontSize: 18 }} />
//           <Typography fontSize="14px" fontWeight={500} color="text.primary">
//             GPA: {gpa}
//           </Typography>
//         </Box>
//       </Box>

//       {/* Progress Bar */}
//       <Box>
//         <ProgressBar
//           value={completionPercentage}
//           percentage={`${completionPercentage}%`}
//           showPercentage={false}
//           height={8}
//           gradientBg={gradientBg}
//         />
//         <Typography fontSize="11px" color="text.secondary" mt={0.5}>
//           {completionPercentage}% Complete • {program}
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default BatchCard;
import { Box, Typography, Chip } from "@mui/material";
// import { Groups, TrendingUp } from "@mui/icons-material";
// import ProgressBar from "../progressBar";

const BatchCard = ({
  batchName,
  batchCode,
  status,
  shift,
  // currentStudents,
  // totalStudents,
  // gpa,
  // completionPercentage,
  // program,
  // gradientBg = "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxShadow: "none",
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          border: "1px solid #E0E0E0",
        },
      }}
    >
      {/* Header with Status */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Chip
          label={status}
          sx={{
            height: "24px",
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor: "#F97316",
            color: "#fff",
            "& .MuiChip-label": {
              padding: "0 12px",
            },
          }}
        />
        <Typography fontSize="12px" fontWeight={500} color="text.secondary">
          {shift}
        </Typography>
      </Box>

      {/* Batch Name & Code */}
      <Box>
        <Typography
          fontSize="20px"
          fontWeight={600}
          color="text.primary"
          mb={0.5}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {batchName}
        </Typography>
        <Typography
          fontSize="12px"
          fontWeight={400}
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {batchCode}
        </Typography>
      </Box>

      {/* Commented Stats & Progress for now */}
      {/*
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Groups sx={{ color: "text.secondary", fontSize: 18 }} />
          <Typography fontSize="14px" fontWeight={500} color="text.primary">
            {currentStudents}/{totalStudents}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <TrendingUp sx={{ color: "text.secondary", fontSize: 18 }} />
          <Typography fontSize="14px" fontWeight={500} color="text.primary">
            GPA: {gpa}
          </Typography>
        </Box>
      </Box>

      <Box>
        <ProgressBar
          value={completionPercentage}
          percentage={`${completionPercentage}%`}
          showPercentage={false}
          height={8}
          gradientBg={gradientBg}
        />
        <Typography fontSize="11px" color="text.secondary" mt={0.5}>
          {completionPercentage}% Complete • {program}
        </Typography>
      </Box>
      */}
    </Box>
  );
};

export default BatchCard;