import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import DialogContainer from "../dialog/dialogContainer";
import DialogBody from "../dialog/dialogBody";
import CustomButton from "../customButton";
import CustomSelect from "../customSelect";
import { useTranslation } from "react-i18next";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  // { value: "bankTransfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  // { value: "tabby", label: "Tabby" },
  // { value: "tamara", label: "Tamara" },
];

const PaymentMethodDialog = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const studentIdRef = useRef(null);
  const amountRef = useRef(null);
  const onConfirmCallbackRef = useRef(null);

  const closeDialog = () => {
    setOpen(false);
    setSelectedMethod("");
    studentIdRef.current = null;
    amountRef.current = null;
    onConfirmCallbackRef.current = null;
  };

  const handleCancel = () => {
    closeDialog();
  };

  const handleConfirm = () => {
    const studentId = studentIdRef.current;
    const amount = amountRef.current;
    const method = selectedMethod;

    if (onConfirmCallbackRef.current && studentId && amount && method) {
      const data = { studentId, amount, method };
      onConfirmCallbackRef.current(data);
      closeDialog();
    } else {
      closeDialog();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      open: (options = {}) => {
        studentIdRef.current = options.studentId || null;
        amountRef.current = options.amount || null;
        onConfirmCallbackRef.current = options.onConfirm || null;
        setSelectedMethod("");
        setOpen(true);
      },
      close: () => {
        closeDialog();
      },
    }),
    []
  );

  return (
    <DialogContainer
      open={open}
      onClose={handleCancel}
      maxWidth="420px"
    >
      <DialogBody>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={2}
          gap={2}
        >
          <Typography
            variant="primaryText"
            textAlign="center"
            fontSize={24}
            fontWeight={600}
          >
            {t("feeCollector.feeCollection.admissionFee.paymentDialog.title")}
          </Typography>

          <Typography
            variant="secondaryText"
            fontSize={14}
            textAlign="center"
            mt={1}
          >
            {t("feeCollector.feeCollection.admissionFee.paymentDialog.description", {
              amount: amountRef.current || 0,
            })}
          </Typography>

          <CustomSelect
            placeholder={t("feeCollector.feeCollection.admissionFee.paymentDialog.selectMethod")}
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            error={!selectedMethod && open}
            fullWidth={true}
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {t(`feeCollector.feeCollection.admissionFee.paymentMethods.${method.value}`) || method.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Box>
      </DialogBody>

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={2}
        mb={4}
        mt={2}
        px={2}
      >
        <CustomButton
          btnLabel={t("feeCollector.feeCollection.admissionFee.paymentDialog.confirm")}
          handlePressBtn={handleConfirm}
          variant="gradient"
          disabled={!selectedMethod}
        />
      </Box>
    </DialogContainer>
  );
});

PaymentMethodDialog.displayName = "PaymentMethodDialog";

export default PaymentMethodDialog;
