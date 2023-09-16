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
  },
};

export const defaultTheme = createTheme(themeOptions);
