import React from "react";
import { Box, Typography } from "@mui/material";
import infoIcon from "..//../assets/icons/info-icon.svg";

/**
 * @param {string} message - full message text
 * @param {string[]} highlights - array of words/phrases to highlight
 */
const InfoMessage = ({ message, highlights = [] }) => {
  // Helper function: splits message into array of parts with highlight info
  const getMessageParts = () => {
    if (!highlights.length) return [{ text: message, isHighlight: false }];

    let parts = [{ text: message, isHighlight: false }];

    highlights.forEach((word) => {
      const newParts = [];
      parts.forEach((part) => {
        if (part.isHighlight) {
          // Already highlighted, keep as is
          newParts.push(part);
        } else {
          // Split by the highlight word
          const splitParts = part.text.split(word);
          splitParts.forEach((splitPart, index) => {
            if (splitPart) newParts.push({ text: splitPart, isHighlight: false });
            if (index < splitParts.length - 1) newParts.push({ text: word, isHighlight: true });
          });
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const messageParts = getMessageParts();

  return (
    <Box
      sx={{
        mt: 3,
        mb: 3,
        backgroundColor: "#F9731640",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        component="img"
        src={infoIcon}
        alt="info"
        sx={{
          width: 24,
          height: 24,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: 14,
          color: "#000",
          "& .highlight": {
            background: "linear-gradient(179.86deg, #FBD604 -11.04%, #EF5322 73.18%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 500,
          },
        }}
      >
        {messageParts.map((part, index) => (
          <Box
            key={index}
            component="span"
            className={part.isHighlight ? "highlight" : undefined}
          >
            {part.text}
          </Box>
        ))}
      </Typography>
    </Box>
  );
};

export default InfoMessage;
