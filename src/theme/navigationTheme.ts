import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { darkTheme, theme as lightTheme } from "./theme";

export const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightTheme.colors.background,
    card: lightTheme.colors.gray100,
    text: lightTheme.colors.text,
    border: lightTheme.colors.gray200,
    primary: lightTheme.colors.primary,
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkTheme.colors.background,
    card: darkTheme.colors.gray100,
    text: darkTheme.colors.text,
    border: darkTheme.colors.gray200,
    primary: darkTheme.colors.primary,
  },
};
