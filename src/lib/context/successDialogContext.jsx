import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import SuccessDialog from "../../components/popups/success";

const SuccessDialogContext = createContext(null);

export const SuccessDialogProvider = ({
  children,
  defaultOptions = {},
}) => {
  const dialogRef = useRef(null);

  const showSuccess = useCallback(
    (options = {}) => {
      dialogRef.current?.open({
        ...defaultOptions,
        ...options,
      });
    },
    [defaultOptions]
  );

  const hideSuccess = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const contextValue = useMemo(
    () => ({
      showSuccess,
      hideSuccess,
    }),
    [showSuccess, hideSuccess]
  );

  return (
    <SuccessDialogContext.Provider value={contextValue}>
      {children}
      <SuccessDialog ref={dialogRef} defaultOptions={defaultOptions} />
    </SuccessDialogContext.Provider>
  );
};

export const useSuccessDialog = () => {
  const context = useContext(SuccessDialogContext);
  if (!context) {
    throw new Error(
      "useSuccessDialog must be used within a SuccessDialogProvider"
    );
  }
  return context;
};


