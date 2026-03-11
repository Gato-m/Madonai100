import { useTheme } from "@shopify/restyle";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useThemeMode } from "../providers/ThemeProvider";
import { Theme } from "../theme";

function ThemedStack() {
  const theme = useTheme<Theme>();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />
    </Stack>
  );
}

function AppContent() {
  const { mode } = useThemeMode();

  return (
    <>
      <ThemedStack />
      <StatusBar style={mode === "light" ? "dark" : "light"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
