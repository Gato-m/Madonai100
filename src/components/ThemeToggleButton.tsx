import { useTheme } from "@shopify/restyle";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useThemeMode } from "../providers/ThemeProvider";
import { Theme } from "../theme";
import { ThemedIcon } from "./ThemedIcon";

const ANIMATION_DURATION = 280;

export function ThemeToggleButton() {
  const theme = useTheme<Theme>();
  const { mode, toggle } = useThemeMode();
  const progress = useSharedValue(mode === "dark" ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(mode === "dark" ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [mode, progress]);

  const sunStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - progress.value,
      transform: [
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, -90])}deg`,
        },
        { scale: interpolate(progress.value, [0, 1], [1, 0.75]) },
      ],
    };
  });

  const moonStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          rotate: `${interpolate(progress.value, [0, 1], [90, 0])}deg`,
        },
        { scale: interpolate(progress.value, [0, 1], [0.75, 1]) },
      ],
    };
  });

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      accessibilityHint="Switch between light and dark mode"
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme.colors.gray200,
          backgroundColor: theme.colors.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.iconStack}>
        <Animated.View style={[styles.iconLayer, sunStyle]}>
          <ThemedIcon name="sunny-outline" size={20} variant="accent" />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, moonStyle]}>
          <ThemedIcon name="moon-outline" size={20} variant="text" />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconStack: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLayer: {
    position: "absolute",
  },
});
