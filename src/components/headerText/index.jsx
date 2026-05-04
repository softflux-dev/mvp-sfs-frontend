import { Box, Typography } from "@mui/material";
import React from "react";

const HeaderText = ({ title, subtitle, fontSize, subtitleFontSize, mb = 2, batchTag , fontWeight }) => {
  return (
    <Box display="flex" flexDirection="column" mb={mb}>
      <Typography variant="primaryText" fontSize={fontSize ? fontSize : 24} fontWeight={fontWeight ? fontWeight : 600}>
        {title}
      </Typography>
      <Box display={"flex"} gap={1}>
        {
          subtitle && (
            <Box>
              <Typography variant="secondaryText" fontSize={subtitleFontSize ? subtitleFontSize : 14}>{subtitle}</Typography>
            </Box>
          )
        }
        {
          batchTag && (
            <Box>
              <Typography bgcolor={"background.emeraldGreen"} color={"#04C373"} borderRadius={"20px"} padding={"5px 8px"} fontSize={"12px"} fontWeight={600}>
                {batchTag}
              </Typography>
            </Box>
          )
        }

      </Box>

    </Box>
  );
};

export default HeaderText;
