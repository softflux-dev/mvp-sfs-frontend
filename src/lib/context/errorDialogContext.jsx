import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import ErrorDialog from "../../components/popups/error";

const ErrorDialogContext = createContext(null);

export const ErrorDialogProvider = ({
  children,
  defaultOptions = {},
}) => {
  const dialogRef = useRef(null);

  const showError = useCallback(
    (options = {}) => {
      dialogRef.current?.open({
        ...defaultOptions,
        ...options,
      });
    },
    [defaultOptions]
  );

  const hideError = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const contextValue = useMemo(
    () => ({
      showError,
      hideError,
    }),
    [showError, hideError]
  );

  return (
    <ErrorDialogContext.Provider value={contextValue}>
      {children}
      <ErrorDialog ref={dialogRef} defaultOptions={defaultOptions} />
    </ErrorDialogContext.Provider>
  );
};

export const useErrorDialog = () => {
  const context = useContext(ErrorDialogContext);
  if (!context) {
    throw new Error(
      "useErrorDialog must be used within an ErrorDialogProvider"
    );
  }
  return context;
};

