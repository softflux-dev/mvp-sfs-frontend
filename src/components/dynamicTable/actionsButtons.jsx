import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Box, Typography, Button } from "@mui/material";
import { MoreVerticalIcon } from "lucide-react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EventIcon from "@mui/icons-material/Event";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CustomButton from "../customButton";

export default function ActionsButtons({
    row,
    onViewProfile = false,
    onViewProfileClick,
    onTrackImprovement = false,
    onTrackImprovementClick,
    onSendReminder = false,
    onSendReminderClick,
    onIssueWarning = false,
    onIssueWarningClick,
    onRestrictAccount = false,
    onRestrictAccountClick,
    onFullLockout = false,
    onFullLockoutClick,
    onApprove = false,
    onReject = false,
    // 👇 ye 3 add karo
    onEditAssignment = false,
    onEditAssignmentClick,
    onViewSubmission = false,
    onViewSubmissionClick,
    onDeleteAssignment = false,
    onDeleteAssignmentClick,
    onViewDetails = false,
    onViewDetailsClick,
    onEditQuestion = false,
    onEditQuestionClick,
    onPdfDownload = false,
    onPdfDownloadClick,
    onDuplicateQuestion = false,
    onDuplicateQuestionClick,
    onDeleteQuestion = false,
    onDeleteQuestionClick,
    onEdit = false,
    onEditClick,
    onDelete = false,
    onDeleteClick,
    onView = false,
    onViewClick,
    onStartExam = false,
    onStartExamClick,
    onSchedule = false,
    onScheduleClick,
    onCancel = false,
    onCancelClick,
    onMarksComplete = false,
    onMarksCompleteClick,
    // Employee role menu (Change Role, View Profile, Block/Activate Access)
    employeeRoleMenu = false,
    onChangeRole = false,
    onChangeRoleClick,
    onBlockAccess = false,
    onBlockAccessClick,
    onActivateAccess = false,
    onActivateAccessClick,
    isAccessBlocked = false,
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (callback) => {
        if (callback) {
            callback(row);
        }
        handleClose();
    };

    return (
        <>
            <IconButton onClick={handleClick} size="small">
                <MoreVerticalIcon size={18} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "20px",
                            minWidth: employeeRoleMenu ? 160 : 180,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            mt: 1,
                            zIndex: 9999,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {employeeRoleMenu ? (
                    <Box px={1.5} py={1} sx={{ minWidth: 50 }}>
                        {onChangeRole && (
                            <CustomButton
                                btnLabel="Change Role"
                                variant="gradient"
                                handlePressBtn={() => handleAction(onChangeRoleClick)}
                                width="100%"
                                
                            />
                        )}
                        {onViewProfile && (
                            <MenuItem
                                onClick={() => handleAction(onViewProfileClick)}
                                sx={{ fontSize: "13px", py: 2, px: 2 }}
                            >
                                <Typography fontSize="13px" color="text.primary" fontWeight={500}>
                                    View Profile
                                </Typography>
                            </MenuItem>
                        )}
                        { onBlockAccess && row.status !== "Inactive" && (
                            <MenuItem
                                onClick={() => handleAction(onBlockAccessClick)}
                                sx={{ fontSize: "13px", py: 2, px: 2, color: "#F97316" }}
                            >
                                <Typography fontSize="13px" color="#F97316" fontWeight={500}>
                                    Block Access
                                </Typography>
                            </MenuItem>
                        )}
                        { onActivateAccess && row.status !== "Active" && (
                            <MenuItem
                                onClick={() => handleAction(onActivateAccessClick)}
                                sx={{ fontSize: "13px", py: 2, px: 2, color: "#22C55E" }}
                            >
                                <Typography fontSize="13px" color="#22C55E" fontWeight={500}>
                                    Activate Access
                                </Typography>
                            </MenuItem>
                        )}
                    </Box>
                ) : (
                    <>
                <Box px={2}>
                    <Typography fontSize="12px" fontWeight="600" color="text.primary" mb={2}>Actions</Typography>
                </Box>
                {onViewProfile && (
                    <MenuItem
                        onClick={() => handleAction(onViewProfileClick)}
                        sx={{ fontSize: "13px", py: 1 }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px">View Profile</Typography>
                        </Box>
                    </MenuItem>
                )}

                {onTrackImprovement && (
                    <MenuItem
                        onClick={() => handleAction(onTrackImprovementClick)}
                        sx={{ fontSize: "13px", py: 1 }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <TrendingUpIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px">Track Improvement</Typography>
                        </Box>
                    </MenuItem>
                )}

                {onSendReminder && (
                    <MenuItem
                        onClick={() => handleAction(onSendReminderClick)}
                        sx={{ fontSize: "13px", py: 1 }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <NotificationsIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px">Send Reminder</Typography>
                        </Box>
                    </MenuItem>
                )}

                {onIssueWarning && (
                    <MenuItem
                        onClick={() => handleAction(onIssueWarningClick)}
                        sx={{ fontSize: "13px", py: 1 }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px">Issue Warning</Typography>
                        </Box>
                    </MenuItem>
                )}

                {onRestrictAccount && (
                    <MenuItem
                        onClick={() => handleAction(onRestrictAccountClick)}
                        sx={{ fontSize: "13px", py: 1, color: "secondary.dark" }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <LockIcon sx={{ fontSize: 18, color: "secondary.dark" }} />
                            <Typography fontSize="13px" color="secondary.dark">Restrict Account</Typography>
                        </Box>
                    </MenuItem>
                )}

                {onFullLockout && (
                    <MenuItem
                        onClick={() => handleAction(onFullLockoutClick)}
                        sx={{ fontSize: "13px", py: 1, color: "secondary.dark" }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <LockIcon sx={{ fontSize: 18, color: "secondary.dark" }} />
                            <Typography fontSize="13px" color="secondary.dark">Full Lockout</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onEditAssignment && (
                    <MenuItem onClick={() => handleAction(onEditAssignmentClick)}>
                        <Typography fontSize="13px">
                            Edit Assignment
                        </Typography>
                    </MenuItem>
                )}

                {onViewSubmission && (
                    <MenuItem onClick={() => handleAction(onViewSubmissionClick)}>
                        <Typography fontSize="13px">
                            View Submission
                        </Typography>
                    </MenuItem>
                )}

                {onDeleteAssignment && (
                    <MenuItem
                        onClick={() => handleAction(onDeleteAssignmentClick)}
                        sx={{ color: "error.main" }}
                    >
                        <Typography fontSize="13px" >
                            Delete
                        </Typography>
                    </MenuItem>
                )}
                {onViewDetails && (
                    <MenuItem onClick={() => handleAction(onViewDetailsClick)}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <VisibilityIcon sx={{ fontSize: 18, color: "#F97316" }} />
                            <Typography fontSize="13px" color="#F97316" fontWeight={500}>
                                View Details
                            </Typography>
                        </Box>
                    </MenuItem>
                )}
                {onEditQuestion && (
                    <MenuItem onClick={() => handleAction(onEditQuestionClick)}>
                        <Typography fontSize="13px">
                            Edit Question
                        </Typography>
                    </MenuItem>
                )}
                {onPdfDownload && (
                    <MenuItem onClick={() => handleAction(onPdfDownloadClick)}>
                        <Typography fontSize="13px">
                            Download PDF
                        </Typography>
                    </MenuItem>
                )}
                {onDuplicateQuestion && (
                    <MenuItem onClick={() => handleAction(onDuplicateQuestionClick)}>
                        <Typography fontSize="13px">
                            Duplicate Question
                        </Typography>
                    </MenuItem>
                )}
                {onDeleteQuestion && (
                    <MenuItem onClick={() => handleAction(onDeleteQuestionClick)}>
                        <Typography fontSize="13px">
                            Delete Question
                        </Typography>
                    </MenuItem>
                )}
                {onStartExam && (
                    <MenuItem onClick={() => handleAction(onStartExamClick)} sx={{ fontSize: "13px", py: 1, color: "#22C55E" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PlayArrowIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Start Exam</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onSchedule && (
                    <MenuItem onClick={() => handleAction(onScheduleClick)} sx={{ fontSize: "13px", py: 1, color: "#F97316" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <EventIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Schedule</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onCancel && (
                    <MenuItem onClick={() => handleAction(onCancelClick)} sx={{ fontSize: "13px", py: 1, color: "#991B1B" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CancelIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Cancel</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onMarksComplete && (
                    <MenuItem onClick={() => handleAction(onMarksCompleteClick)} sx={{ fontSize: "13px", py: 1, color: "#22C55E" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Marks Complete</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onEdit && (
                    <MenuItem onClick={() => handleAction(onEditClick)} sx={{ fontSize: "13px", py: 1, color: "#1E40AF" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <EditIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Edit</Typography>
                        </Box>
                    </MenuItem>
                )}
                {onDelete && (
                    <MenuItem
                        onClick={() => handleAction(onDeleteClick)}
                        sx={{ fontSize: "13px", py: 1, color: "#DC2626" }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                            <Typography fontSize="13px" fontWeight={500}>Delete</Typography>
                        </Box>
                    </MenuItem>
                )}
                    </>
                )}
            </Menu>
        </>
    );
}
