import { useTheme } from "@shopify/restyle";
import { Stack } from "expo-router";
import { Theme } from "../../theme";

export default function ModalsLayout() {
  const theme = useTheme<Theme>();

  return (
    <Stack
      screenOptions={{
        presentation: "modal",

        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },

        headerTintColor: theme.colors.text,
      }}
    />
  );
}
