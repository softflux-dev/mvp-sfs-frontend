const GlobalStyle = {
  datePickerStyle: {
    width: "100%",

    "& .MuiPickersInputBase-root": {
      borderRadius: "8px",
      backgroundColor: " #EFEFEF",
      borderRadius: "14px",
      border: "none",

      "& .MuiPickersSectionList-root": {
        padding: "11px",
        
      },

      "& .MuiPickersOutlinedInput-notchedOutline": {
        border: `1px solid #EFEFEF`,
        "&:hover": {
          border: `1px solid #EFEFEF !important`,
        },
        "&.Mui-focused": {
          border: `1px solid #EFEFEF`,
        },
      },
    },
    "&.MuiFormControl-root": {
      "& .MuiFormHelperText-root": {
        marginLeft: "0px",
      },
    },
  },

  smallDatePickerStyle: {
    width: "100%",

    "& .MuiPickersInputBase-root": {
      borderRadius: "6px",
      //backgroundColor: "#fff",
      borderRadius: "14px",
      border: "none",
      backgroundColor: "primary.lightGray",
      fontSize: "16px",

      "& .MuiPickersSectionList-root": {
        padding: "0px",
      },

      "& .MuiPickersOutlinedInput-notchedOutline": {
        border: `1px solid #EFEFEF`,
        "&:hover": {
          border: `1px solid #EFEFEF !important`,
        },
        "&.Mui-focused": {
          border: `1px solid #EFEFEF`,
        },
      },
    },

    "&.MuiFormControl-root": {
      "& .MuiFormHelperText-root": {
        marginLeft: "0px",
      },
    },
  },

  // ── Pass this via slotProps={{ popper: { sx: GlobalStyle.datePickerPopperSx } }}
  // on every DatePicker. Targets the year/day popper directly — it's portaled
  // to document.body, so plain sx on the DatePicker root never reaches it.
  datePickerPopperSx: {
    "& .MuiPickersYear-yearButton.Mui-selected": {
      backgroundColor: "#AA2493 !important",
      color: "#ffffff !important",
    },
    "& .MuiPickersYear-yearButton.Mui-selected:hover, & .MuiPickersYear-yearButton.Mui-selected:focus": {
      backgroundColor: "#AA2493 !important",
      color: "#ffffff !important",
    },
  },
  datePickerPopperSx: {
    "& [role='radio'][aria-checked='true']": {
      background: "linear-gradient(90deg, #AA2493 0%, #022179 100%) !important",
      color: "#ffffff !important",
    },
  },
};

export default GlobalStyle;