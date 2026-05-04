import React from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const CustomCheckbox = ({
    label,
    checked,
    onChange,
    labelColor = "#767676",
    fontSize = "14px",
    fontWeight = 500
}) => {
    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked}
                    onChange={onChange}
                    icon={
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '8px',
                                border: '1px solid #ADADAD',
                                backgroundColor: '#fff',
                            }}
                        />
                    }
                    checkedIcon={
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '8px',
                                backgroundColor: 'orange',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 16 }} />
                        </Box>
                    }
                />
            }
            label={
                <Typography
                    sx={{
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        color: labelColor,
                    }}
                >
                    {label}
                </Typography>
            }
        />
    );
};

export default CustomCheckbox;
    