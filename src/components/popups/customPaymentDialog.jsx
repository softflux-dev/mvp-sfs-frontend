import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import { Box, Typography } from "@mui/material";
import DialogContainer from "../dialog/dialogContainer";
import DialogBody from "../dialog/dialogBody";
import CustomButton from "../customButton";
import TextInput from "../textInput";

const CustomPaymentDialog = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const orderIdRef = useRef(null);
  const onConfirmCallbackRef = useRef(null);

  const closeDialog = () => {
    setOpen(false);
    setPaymentAmount("");
    orderIdRef.current = null;
    onConfirmCallbackRef.current = null;
  };

  const handleCancel = () => {
    closeDialog();
  };

  const handleConfirm = () => {
    const orderId = orderIdRef.current;
    const amount = paymentAmount;
    
    if (onConfirmCallbackRef.current && orderId && amount) {
      const data = { orderId, paymentAmount: parseFloat(amount) };
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
        orderIdRef.current = options.orderId || null;
        onConfirmCallbackRef.current = options.onConfirm || null;
        setPaymentAmount("");
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
      <DialogBody boxProps={{ textAlign: "center" }}>
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
            Add Price
          </Typography>

          <Box width="100%" mt={2}>
            <TextInput
              placeholder="Payment Amount"
              name="paymentAmount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              type="number"
              showLabel="Payment Amount"
            />
          </Box>
        </Box>
      </DialogBody>

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap={2}
        mb={4}
        mt={2}
      >
        <CustomButton
          btnLabel="Cancel"
          handlePressBtn={handleCancel}
          variant="customOutlined"
          width="120px"
        />

        <CustomButton
          btnLabel="Confirm"
          handlePressBtn={handleConfirm}
          variant="gradient"
          width="120px"
          disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
        />
      </Box>
    </DialogContainer>
  );
});

CustomPaymentDialog.displayName = "CustomPaymentDialog";

export default CustomPaymentDialog;

