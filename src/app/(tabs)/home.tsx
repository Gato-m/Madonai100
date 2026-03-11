import { useRouter } from "expo-router";
import { Mlogo, ThemedSpacer, ThemedView } from "../../components";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Mlogo width={180} height={1000} marginTop={"-50%"} />

      <ThemedSpacer size="xl" />
    </ThemedView>
  );
}
