import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { ThemedText, ThemedView } from "../../components";

export default function SettingsModal() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </Pressable>
          ),
        }}
      />

      <ThemedView>
        <ThemedText>About Modal</ThemedText>
      </ThemedView>
    </>
  );
}
