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
};

export default GlobalStyle;
