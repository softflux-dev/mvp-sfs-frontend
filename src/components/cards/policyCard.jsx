import { Box, Typography, Chip, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPolicyCategoryChipStyles } from "../../utils/categoryColors";

const PolicyCard = ({
  // Content
  icon: IconComponent, // Changed to accept component
  category,
  title,
  description,
  updatedDate,

  // Action
  onReadMore,
  onEdit,
  onDelete,

  // Customization
  cardBorderRadius = "12px",
  iconBgGradient = "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",

  // Additional props
  categoryLabel,
}) => {
  const { t } = useTranslation();

 

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: cardBorderRadius,
        padding: "24px",
        boxShadow: "none",
        border: "1px solid #F5F5F5",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          border: "1px solid #E0E0E0",
        },
      }}
    >
      {/* Icon & Category */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        {/* Icon */}
        {IconComponent && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: iconBgGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent
              sx={{
                fontSize: 24,
                color: "#fff",
              }}
            />
          </Box>
        )}

        {/* Category Badge */}
        {category && (
          <Chip
            label={categoryLabel || category}
            sx={getPolicyCategoryChipStyles(category)}
          />
        )}
      </Box>

      {/* Edit & Delete Icons - below category */}
      {(onEdit || onDelete) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 2,
            justifyContent: "flex-end",
          }}
        >
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#F3F4F6" },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#FEE2E2" },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
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
          lineHeight: 1.4,
          minHeight: "50px",
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        mb={2}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.5,
          minHeight: "42px",
        }}
      >
        {description}
      </Typography>

      {/* Footer - Updated Date & Read More */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2,
          borderTop: "1px solid #F5F5F5",
        }}
      >
        {/* Updated Date */}
        <Typography variant="caption" color="text.secondary">
          {t("hrDirector.policyManagement.policyCard.updated")} {updatedDate}
        </Typography>

        {/* Read More Link */}
        {onReadMore && (
          <Typography
            onClick={onReadMore}
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              background:
                "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "opacity 0.2s ease",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {t("hrDirector.policyManagement.policyCard.readMore")} →
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PolicyCard;