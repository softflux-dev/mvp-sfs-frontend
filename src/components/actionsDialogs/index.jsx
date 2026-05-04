import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useState,
} from "react";
import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import DialogContainer from "../dialog/dialogContainer";
import DialogHeader from "../dialog/dialogHeader";
import DialogBody from "../dialog/dialogBody";
import DialogActionButtons from "../dialog/dialogAction";
import TextInput from "../textInput";
import ModalContentBox from "../dialog/ModalContentBox";

const defaultDialogState = {
    open: false,
    actionType: null,
    studentName: "",
    studentId: "",
    reason: "",
    onConfirm: undefined,
    onClose: undefined,
};

const ActionsDialog = forwardRef(({ defaultOptions = {} }, ref) => {
    const { t } = useTranslation();

    // Action configurations with translations
    const actionConfigs = {
        issueWarning: {
            title: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.issueWarning.title"),
            effectMessage: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.issueWarning.effectMessage"),
            effectColor: "#000000",
        },
        restrictAccount: {
            title: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.restrictAccount.title"),
            effectMessage: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.restrictAccount.effectMessage"),
            effectColor: "#000000",
        },
        fullLockout: {
            title: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.fullLockout.title"),
            effectMessage: t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.fullLockout.effectMessage"),
            effectColor: "#FF0004",
        },
    };
    const [dialogState, setDialogState] = useState(() => ({
        ...defaultDialogState,
        ...defaultOptions,
    }));

    const [reason, setReason] = useState("");

    const close = useCallback(() => {
        setDialogState((prev) => ({ ...prev, open: false }));
        setReason(""); // Reset reason on close
        if (typeof dialogState.onClose === "function") {
            dialogState.onClose();
        }
    }, [dialogState.onClose]);

    const open = useCallback(
        (options = {}) => {
            const nextState = {
                ...defaultDialogState,
                ...defaultOptions,
                ...options,
                open: true,
            };
            setDialogState(nextState);
            setReason(options.reason || ""); // Set reason if provided
        },
        [defaultOptions]
    );

    const handleConfirm = useCallback(() => {
        if (!reason.trim()) {
            return;
        }

        if (typeof dialogState.onConfirm === "function") {
            dialogState.onConfirm({
                actionType: dialogState.actionType,
                studentName: dialogState.studentName,
                studentId: dialogState.studentId,
                reason: reason.trim(),
            });
        }
        close();
    }, [reason, dialogState, close]);

    useImperativeHandle(
        ref,
        () => ({
            open,
            close,
        }),
        [open, close]
    );

    const currentConfig = dialogState.actionType
        ? actionConfigs[dialogState.actionType]
        : null;

    if (!currentConfig) {
        return null;
    }

    const isReasonValid = reason.trim().length > 0;

    return (
        <DialogContainer
            open={dialogState.open}
            onClose={close}
            maxWidth="600px"
        >
            <DialogHeader
                title={currentConfig.title}
                secondaryHeading={`${t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.applyingActionTo")} ${dialogState.studentName} (${dialogState.studentId})`}
                onClose={close}
            />

            <DialogBody>
                <Stack spacing={3}>
                    {/* Reason Input */}
                    <Box>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            mb={1}
                            color="text.primary"
                        >
                            {t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.reason")} *
                        </Typography>
                        <TextInput
                            placeholder={t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.reasonPlaceholder")}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            multiline
                            rows={4}
                            inputBgColor="#F7F7F7"
                        />
                    </Box>

                    {/* Action Effect */}
                    <ModalContentBox>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            mb={1}
                            color="text.primary"
                        >
                            {t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.actionEffect")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={currentConfig.effectColor}
                        >
                            {currentConfig.effectMessage}
                        </Typography>
                    </ModalContentBox>
                </Stack>
            </DialogBody>

            <DialogActionButtons
                onConfirm={handleConfirm}
                onCancel={close}
                confirmText={t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.applyAction")}
                cancelText={t("academicManagement.centralAttendance.studentMonitoring.actionsDialog.cancel")}
                isConfirmBtnDisable={!isReasonValid}
                showConfirmIcon={false}
            />
        </DialogContainer>
    );
});

ActionsDialog.displayName = "ActionsDialog";

export default ActionsDialog;
