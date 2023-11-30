import { ThemeOptions, createTheme } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#00c3ff",
    },
    secondary: {
      main: "#81f9bf",
    },
    error: {
      main: "#ff4205",
    },
  },
};

export const defaultTheme = createTheme(themeOptions);
