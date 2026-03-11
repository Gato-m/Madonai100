import React from "react";
import { View, ViewProps } from "react-native";

export function ThemedView({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "transparent",
          flex: 1,
        },
        style,
      ]}
      {...rest}
    />
  );
}
