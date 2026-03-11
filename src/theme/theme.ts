// theme.ts
import { createTheme } from "@shopify/restyle";

export const LightPalette = {
  primary: "#f3f3f3",
  primaryDark: "#D4D4D8",
  accent: "#f0983e",
  gray100: "#f4f4f4",
  gray200: "#dbdddb",
  gray400: "#9a9b9b",
  gray800: "#5a5a5a",
  white: "#F3F4F6",
  black: "#000000",
  text: "#424141",
  textSecondary: "#f1f1f2",
  background: "#e7e7e7",
};
export const DarkPalette = {
  primary: "#3e4353",
  primaryDark: "#2f3340",
  accent: "#f0983e",
  gray100: "#f4f4f4",
  gray200: "#dbdddb",
  gray400: "#9a9b9b",
  gray800: "#5a5a5a",
  white: "#F3F4F6",
  black: "#000000",
  text: "#eaeaea",
  textSecondary: "#f1f1f2",
  background: "#22252b",
};

export const createAppTheme = (palette: typeof LightPalette) =>
  createTheme({
    colors: {
      ...palette,
      background: palette.background,
      text: palette.text,
    },

    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
    },

    borderRadii: {
      s: 4,
      m: 8,
      l: 16,
      full: 999,
    },

    textVariants: {
      defaults: {
        color: "text",
        fontSize: 16,
        fontFamily: "Inter-Regular",
      },
      header: {
        // color: "text",
        fontSize: 28,
        fontFamily: "Inter-Regular",
      },
      body: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
      },
      small: {
        fontSize: 12,
        fontFamily: "Inter-Regular",
      },
    },

    buttonVariants: {
      primary: {
        backgroundColor: "accent",
        padding: "m",
        borderRadius: "m",
      },
      secondary: {
        backgroundColor: "gray100",
        padding: "m",
        borderRadius: "m",
        borderWidth: 1,
        borderColor: "primary",
      },
      accent: {
        backgroundColor: "accent",
        padding: "m",
        borderRadius: "m",
        borderWidth: 1,
        borderColor: "primary",
      },
    },

    breakpoints: {
      phone: 0,
      tablet: 768,
    },
  });

export type Theme = ReturnType<typeof createAppTheme>;
