import { useTheme } from "@shopify/restyle";
import { Stack } from "expo-router";
import { Theme } from "../../theme";

export default function ModalsLayout() {
  const theme = useTheme<Theme>();

  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        animation: "slide_from_bottom",

        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },

        // 🔥 ŠIS ir kritiski — jābūt tieši šeit
        headerTintColor: theme.colors.text,
      }}
    />
  );
}
