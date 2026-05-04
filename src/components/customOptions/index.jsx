import React from "react";
import { Box, Radio, TextField, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
const CustomOptions = ({
    label,
    value,
    onChange,
    onSelect,
    onDelete,
    selected = false,
    placeholder,
    showDelete = true,
}) => {
    const optionLabel = typeof label === "string" ? `${label}.` : `${label}.`;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
            }}
        >
            {/* Radio - orange outline */}
            <Radio
                checked={selected}
                onChange={onSelect}
                sx={{
                    color: "primary.main",
                    p: 0.5,
                    "& .MuiSvgIcon-root": {
                        fontSize: 22,
                    },
                    "&.Mui-checked": {
                        color: "primary.main",
                    },
                }}
            />

            {/* Option label - bold A., B., etc. */}
            <Box
                component="span"
                sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "text.color",
                    minWidth: 24,
                }}
            >
                {optionLabel}
            </Box>

            {/* Input field - rounded, light grey border, white bg */}
            <TextField
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        background: "#FFFFFF",
                        border: "1px solid #E0E0E0",
                        "& fieldset": {
                            border: "none",
                        },
                        "&:hover": {
                            borderColor: "#BDBDBD",
                        },
                        "&.Mui-focused": {
                            borderColor: "primary.main",
                            borderWidth: "1px",
                        },
                    },
                    "& .MuiInputBase-input": {
                        padding: "10px 14px",
                        fontSize: 14,
                        color: "#000000",
                        "&::placeholder": {
                            color: "#808080",
                            opacity: 1,
                        },
                    },
                }}
            />

            {/* Delete icon - red */}
            {showDelete && (
                <IconButton
                    onClick={onDelete}
                    size="small"
                    sx={{
                        color: "#FF0000",
                        p: 0.75,
                        "&:hover": {
                            color: "error.main",
                            backgroundColor: "background.lightRed",
                        },
                    }}
                >
                    <Trash2 size={18} strokeWidth={2} />
                </IconButton>
            )}
        </Box>
    );
};

export default CustomOptions;
