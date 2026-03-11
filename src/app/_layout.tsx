import { useTheme } from "@shopify/restyle";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemeProvider, useThemeMode } from "../providers/ThemeProvider";
import { Theme } from "../theme";

const topBg = require("../../assets/images/TopBg.png");
const topBgSource = Image.resolveAssetSource(topBg);
const topBgAspectRatio = topBgSource.height / topBgSource.width;

function ThemedStack() {
  const theme = useTheme<Theme>();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "transparent",
        },
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
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
  const { width } = useWindowDimensions();
  const topBgHeight = Math.round(width * topBgAspectRatio);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/FullBg.jpg")}
        resizeMode="cover"
        style={styles.background}
      />
      <Image
        source={topBg}
        resizeMode="contain"
        style={[styles.topBackground, { width, height: topBgHeight }]}
      />
      <ThemedStack />
      <StatusBar style={mode === "light" ? "dark" : "light"} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
