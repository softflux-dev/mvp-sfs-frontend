import { Box, Typography, Chip, LinearProgress } from "@mui/material";
import CustomButton from "../customButton";

const CourseCard = ({
  // Image & Content
  image,
  category,
  discount,
  title,
  
  // Top Info (Duration & Instructor/Lessons)
  leftIcon,
  leftText,
  rightIcon,
  rightText,
  
  // Progress Section
  showProgress = false,
  progress,
  progressLabel = "Performance",
  progressInfo,
  
  // Button
  btnLabel = "Open Course",
  onOpenCourse,
  
  // Customization
  showCategory = true,
  showDiscount = true,
  cardBorderRadius = "20px",
  imageBorderRadius = "20px 20px 0 0",
  gradientBg = "linear-gradient(126.79deg, #FBD604 -5.59%, #EF5322 101.32%)",
  
  // Additional custom content
  renderCustomContent,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        overflow: "hidden",
        boxShadow: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "60%",
          overflow: "hidden",
          borderRadius: imageBorderRadius,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Category Badge */}
        {showCategory && category && (
          <Chip
            label={category}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              backgroundColor: "#fff",
              color: "text.primary",
              fontWeight: 500,
              fontSize: "12px",
              height: "28px",
              borderRadius: "20px",
            }}
          />
        )}

        {/* Discount Badge */}
        {showDiscount && discount && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              background: gradientBg,
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              padding: "6px 12px",
              borderRadius: "20px",
            }}
          >
            {discount}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ padding: "20px" }}>
        {/* Duration with Icon */}
        {leftIcon && leftText && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
            <Box
              sx={{
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={leftIcon}
                alt="left-info"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {leftText}
            </Typography>
          </Box>
        )}

        {/* Title */}
        <Typography
          fontSize="18px"
          fontWeight={600}
          color="text.primary"
          mb={1.5}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
            minHeight: "47px",
          }}
        >
          {title}
        </Typography>

        {/* Instructor with Icon */}
        {rightIcon && rightText && (
          <Box display="flex" alignItems="center" gap={0.5} mb={2}>
            <Box
              sx={{
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={rightIcon}
                alt="right-info"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {rightText}
            </Typography>
          </Box>
        )}

        {/* Custom Content (for additional flexibility) */}
        {renderCustomContent && renderCustomContent()}

        {/* Progress Section */}
        {showProgress && progress !== undefined && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                {progressLabel}
              </Typography>
              {progressInfo && (
                <Typography variant="caption" fontWeight={600} color="text.primary">
                  {progressInfo}
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "primary.lightGray",
                "& .MuiLinearProgress-bar": {
                  background: gradientBg,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Action Button */}
        {onOpenCourse && (
          <CustomButton
            btnLabel={btnLabel}
            handlePressBtn={onOpenCourse}
            variant="courseCard"
          />
        )}
      </Box>
    </Box>
  );
};

export default CourseCard;