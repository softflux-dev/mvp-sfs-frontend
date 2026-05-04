import { createTheme } from "@mui/material/styles";

const getTheme = (direction = "ltr") =>
  createTheme({
    direction: direction,
    palette: {
      primary: {
        main: "#AA2493",
        maintwo: "#022179",
        text: "#151515",
        light: "#D474C4",
        lightGray: "#F5F5F5",
        darkGray: "#4B4B4B",
        dark: "#022179",
        contrastText: "#151515",
        lightOrange: "#AA24931A", // renamed semantically but key kept for compat
      },
      text: {
        primary: "#030229",
        secondary: "#67768B",
        black: "#000",
        gray: "#67768B",
        emeraldGreen: "#04C373",
        color: "#000000",
        orange: "#AA2493",        // was #F97316
        lightColor: "#00000080",
        red: "#FF0000",
        blueColor: "#2B6EFF",
        lightGrey: "#767676",
      },
      secondary: {
        main: "#022179",
        light: "#fff",
        dark: "#010E3A",
        contrastText: "#ffffff",
        lightWhite: "#f0f1f2",
        divider: "#E0E0E0",
      },
      background: {
        default: "#ffffff",
        paper: "#ffffff",
        dark: "#ffff",
        card: "#ffffff",
        cardLight: "#F6F6F6",
        cardDark: "#efefef",
        emeraldGreen: "#04C3731A",
        lightBlack: "#0000001A",
        lightOrange: "#AA24931A",  // was #F973161A
        lightRed: "#FF00001A",
        lightWhite: "#FDFDFD",
        lightBlue: "#0051FF1A",
        lightPurple: "#AA24931A",  // new alias
      },
      gradient: {
        primary: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
        secondary: "linear-gradient(90deg, #AA249300, #022179)",
        card: "linear-gradient(135deg, #AA2493, #022179)",
        auth: "linear-gradient(135deg, #151515, #AA2493)",
        appGradient: "linear-gradient(90deg, #AA2493, #022179)",
        iconBox: "linear-gradient(179.86deg, #AA2493 -11.04%, #022179 73.18%)",
      },
      customGradient: {
        appGradient: "linear-gradient(90deg, #AA2493, #022179)",
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#c62828",
      },
      success: {
        main: "#AA2493",
        light: "#AA2493",
        dark: "#022179",
      },
    },
    typography: {
      fontFamily: '"Poppins", sans-serif',
      h1: {
        fontSize: 48,
        fontWeight: 700,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      h2: {
        fontSize: 40,
        fontWeight: 700,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      h3: {
        fontSize: 32,
        fontWeight: 700,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      h4: {
        fontSize: 28,
        fontWeight: 600,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      h5: {
        fontSize: 24,
        fontWeight: 600,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      h6: {
        fontSize: 20,
        fontWeight: 600,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      subtitle1: {
        fontSize: 16,
        fontWeight: 500,
        color: "#67768B",
        fontFamily: '"Poppins", sans-serif',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: 14,
        fontWeight: 400,
        color: "#67768B",
        fontFamily: '"Poppins", sans-serif',
        lineHeight: 1.5,
      },
      noteText: {
        fontSize: 10,
        fontWeight: 400,
        color: "#808080",
        fontFamily: '"Poppins", sans-serif',
      },
      body1: {
        fontSize: 16,
        fontWeight: 400,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      body2: {
        fontSize: 14,
        fontWeight: 400,
        color: "#67768B",
        fontFamily: '"Poppins", sans-serif',
      },
      caption: {
        fontSize: 12,
        fontWeight: 400,
        color: "#67768B",
        fontFamily: '"Poppins", sans-serif',
      },
      primaryText: {
        fontSize: 16,
        fontWeight: 700,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
      },
      captionText: {
        fontSize: 11,
        fontWeight: 400,
        color: "#67768B",
        fontFamily: '"Poppins", sans-serif',
      },
      secondaryText: {
        fontSize: 12,
        fontWeight: 400,
        color: "#666666",
        fontFamily: '"Poppins", sans-serif',
      },
      button: {
        fontSize: 16,
        fontWeight: 500,
        color: "#000",
        fontFamily: '"Poppins", sans-serif',
        textTransform: "none",
        small2: {
          fontSize: 10,
          fontWeight: 400,
          color: "#67768B",
          fontFamily: '"Poppins", sans-serif',
          lineHeight: 1.5,
        },
      },
      discountText: {
        color: "#00000080",
        fontSize: "15px",
      },
      createTemplatesText: {
        color: "#000000",
        fontSize: "28px",
        fontWeight: 600,
      },
      fieldContainer: {
        bgcolor: "#FFFFFF",
        p: 4,
        borderRadius: "20px",
      },
      formLabel: {
        color: "#00000080",
        fontSize: "16px",
        fontWeight: 500,
      },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
            fontWeight: 400,
            fontFamily: '"Poppins", sans-serif',
          },
        },
        variants: [
          {
            props: { variant: "gradient" },
            style: {
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              color: "#ffffff",
              padding: "12px",
              fontSize: "16px",
              "&:hover": {
                background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(170, 36, 147, 0.3)",
              },
            },
          },
          {
            props: { variant: "cancelBtn" },
            style: {
              background: "#FFFFFF",
              color: "#AA2493",
              padding: "12px",
              fontSize: "16px",
            },
          },
          {
            props: { variant: "previousBtn" },
            style: {
              background: "#FFFFFF",
              color: "#AA2493",
              py: 0,
              px: 5,
              fontSize: "16px",
              fontWeight: 700,
            },
          },
          {
          props: { variant: "gradientText" },
          style: {
            backgroundColor: "#a09f9f",        
            color: "transparent",
            backgroundImage: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "12px",
            border: "1px solid #F5F5F5",    
            "&:hover": {
              backgroundColor: "#fafafa",
              opacity: 0.9,
            },
          },
        },
          {
            props: { variant: "authbutton" },
            style: {
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              color: "#fff",
              padding: "30px 30px",
              fontSize: "18px",
              borderRadius: "8px",
              fontWeight: 700,
              "&:hover": {
                background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(170, 36, 147, 0.3)",
              },
            },
          },
           {
            props: { variant: "chooseFile" },
            style: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 16px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #E0E0E0",
              backgroundColor: "#F5F5F5",
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: "unset",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#EBEBEB",
                border: "1px solid #E0E0E0",
              },
            },
          },
          {
            props: { variant: "button" },
            style: {
              backgroundColor: "#F5F5F5",
              color: "#000",
              fontSize: "14px",
              fontWeight: 500,
              height: "36px",
              minWidth: "120px",
              borderRadius: "8px",
              padding: "6px 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              "&:hover": {
                backgroundColor: "#EDEDED",
              },
              "&.Mui-disabled": {
                backgroundColor: "#E0E0E0",
                color: "#9E9E9E",
              },
            },
          },
          {
            props: { variant: "gradientbtn" },
            style: {
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              color: "#ffffff",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                transition: "left 0.5s",
              },
              "&:hover": {
                transform: "translateY(-3px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(170, 36, 147, 0.35)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(-1px) scale(0.98)",
              },
            },
          },
          {
            props: { variant: "webbutton" },
            style: {
              background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              color: "#ffffff",
              padding: "30px 30px",
              fontSize: "18px",
              borderRadius: "12px",
              fontWeight: 500,
              "&:hover": {
                background: "linear-gradient(90deg, #022179 0%, #AA2493 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(170, 36, 147, 0.3)",
              },
            },
          },
          {
            props: { variant: "errorbtn" },
            style: {
              background: "linear-gradient(to top, #FDA1A1, #FF0000)",
              color: "#ffff",
              padding: "30px 30px",
              fontSize: "18px",
              borderRadius: "8px",
              fontWeight: 500,
              "&:hover": {
                background: "linear-gradient(to top, #FDA1A1, #FF0000)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              },
            },
          },
          {
            props: { variant: "customOutlined" },
            style: {
              backgroundColor: "#fff",
              fontSize: 12,
              height: 30,
              width: 150,
              borderRadius: "16px",
              textTransform: "none",
              border: "2px solid #AA2493",
              borderColor: "#AA2493",
              color: "#AA2493",
            },
          },
          {
            props: { variant: "gradientText" },
            style: {
              backgroundColor: "#F5F5F5",
              color: "transparent",
              backgroundImage:
                "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#F5F5F5",
                opacity: 0.85,
              },
              "&.Mui-disabled": {
                opacity: 0.5,
              },
            },
          },
          {
            props: { variant: "courseCard" },
            style: {
              width: "100%",
              backgroundColor: "#F6F6F6",
              color: "#000",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: 500,
              padding: "10px",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
              },
              "&:active": {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
              },
            },
          },
          {
            props: { variant: "viewDetailsBtn" },
            style: {
              width: "100%",
              backgroundColor: "#F0F0F0",
              color: "#000000",
              fontWeight: 600,
              borderRadius: "10px",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
              },
              "&:active": {
                background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
                color: "#fff",
              },
            },
          },
          {
            props: { variant: "grayOutlined" },
            style: {
              backgroundColor: "#f5f5f5",
              fontSize: 14,
              height: 45,
              fontWeight: 700,
              width: "fit-content",
              borderRadius: "12px",
             
              color: "#000",
              border: "1px solid #eee",
            },
          },
          {
            props: { variant: "customGray" },
            style: {
              backgroundColor: "#f5f5f5",
              fontSize: 12,
              height: 45,
              padding: "0 20px",
              borderRadius: "12px",
              textTransform: "none",
              color: "#AA2493",
            },
          },
        ],
      },

      MuiChip: {
        variants: [
          {
            props: { variant: "success" },
            style: {
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#e5f9f1",
              color: "#0da757ff",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
            },
          },
          {
            props: { variant: "mainChip" },
            style: {
              fontSize: 11,
              fontWeight: 500,
              backgroundColor: "#AA24931A",
              color: "#AA2493",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
              padding: "2px 10px",
            },
          },
          {
            props: { variant: "default" },
            style: {
              fontSize: 11,
              fontWeight: 500,
              backgroundColor: "#f5f5f5",
              color: "#000000",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
              padding: "2px 10px",
            },
          },
          {
            props: { variant: "error" },
            style: {
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#FF00001A",
              color: "#ff0808ff",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
            },
          },
          {
            props: { variant: "chip_success" },
            style: {
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#04C3731A",
              color: "#04C373",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
              width: "40px",
              height: "auto",
            },
          },
          {
            props: { variant: "chip_warning" },
            style: {
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#AA24931A",
              color: "#AA2493",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
              width: "40px",
              height: "auto",
            },
          },
          {
            props: { variant: "chip_error" },
            style: {
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: "#FF00001A",
              color: "#FF0000",
              fontFamily: '"Poppins", sans-serif',
              lineHeight: "normal",
              width: "40px",
              height: "auto",
            },
          },
        ],
      },

      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: '"Poppins", sans-serif',
          },
        },
      },

      MuiSlider: {
        styleOverrides: {
          root: {
            color: "#AA2493",
            height: 6,
          },
          thumb: {
            width: 20,
            height: 20,
            backgroundColor: "#AA2493",
            border: "3px solid #fff",
            boxShadow: "0 2px 8px rgba(170, 36, 147, 0.3)",
            "&:hover": {
              boxShadow: "0 0 0 8px rgba(170, 36, 147, 0.16)",
            },
          },
          track: {
            background: "linear-gradient(90deg, #AA2493 0%, #022179 100%)",
            border: "none",
            height: 6,
          },
          rail: {
            backgroundColor: "#F5F5F5",
            height: 6,
          },
          mark: {
            width: 2,
            height: 12,
            backgroundColor: "#E0E0E0",
            opacity: 1,
          },
          markActive: {
            backgroundColor: "#fff",
          },
          markLabel: {
            fontSize: 12,
            color: "#67768B",
            fontWeight: 500,
            top: 30,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "#E0E0E0",
          },
        },
      },
    },
  });

export default getTheme;