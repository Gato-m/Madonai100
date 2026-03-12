import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shopify/restyle";
import { Image as ExpoImage } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useEvents } from "../../hooks/useAirtable";
import { Theme } from "../../theme";

const eventTimeFormatter = new Intl.DateTimeFormat("lv-LV", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatEventTime(dateString?: string): string | null {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return eventTimeFormatter.format(parsed);
}

function getCategoryIconName(
  category?: string,
): keyof typeof Ionicons.glyphMap {
  const normalized = (category ?? "").toLowerCase();

  if (
    normalized.includes("muz") ||
    normalized.includes("mūz") ||
    normalized.includes("music") ||
    normalized.includes("koncert") ||
    normalized.includes("dj")
  ) {
    return "musical-notes-outline";
  }

  if (
    normalized.includes("kino") ||
    normalized.includes("film") ||
    normalized.includes("movie")
  ) {
    return "film-outline";
  }

  if (
    normalized.includes("edien") ||
    normalized.includes("ēdien") ||
    normalized.includes("food") ||
    normalized.includes("restoran")
  ) {
    return "restaurant-outline";
  }

  if (
    normalized.includes("sports") ||
    normalized.includes("sport") ||
    normalized.includes("fitness")
  ) {
    return "football-outline";
  }

  if (
    normalized.includes("maksla") ||
    normalized.includes("māksla") ||
    normalized.includes("art") ||
    normalized.includes("izstade") ||
    normalized.includes("izstāde")
  ) {
    return "color-palette-outline";
  }

  if (
    normalized.includes("lekc") ||
    normalized.includes("workshop") ||
    normalized.includes("meistarklas")
  ) {
    return "book-outline";
  }

  return "calendar-outline";
}

export default function EventModal() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const { events, isLoading, error } = useEvents();

  const event = events.find((item) => item.id === eventId);
  const imageUrl = event?.fields.attēls?.[0]?.url;

  useEffect(() => {
    if (imageUrl) {
      void ExpoImage.prefetch(imageUrl, "memory-disk");
    }
  }, [imageUrl]);

  const start = formatEventTime(event?.fields.sākums);
  const end = formatEventTime(event?.fields.beigas);
  const category = event?.fields.kategorija?.trim() || "Cita kategorija";
  const iconName = getCategoryIconName(event?.fields.kategorija);

  return (
    <>
      <Stack.Screen options={{ title: "Pasākums" }} />

      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topActionsRow}>
            <View style={styles.categoryRow}>
              <Ionicons
                name={iconName}
                size={20}
                color={theme.colors.accent}
                style={styles.categoryIcon}
              />
              <ThemedText
                variant="body"
                style={{ color: theme.colors.gray800 }}
              >
                {category}
              </ThemedText>
            </View>

            <Pressable
              onPress={() => router.back()}
              style={[
                styles.circleButton,
                {
                  borderColor: theme.colors.gray400,
                  backgroundColor: theme.colors.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close event"
            >
              <Ionicons
                name="close-outline"
                size={18}
                color={theme.colors.accent}
              />
            </Pressable>
          </View>

          {isLoading && (
            <ThemedText style={styles.message}>Ielāde...</ThemedText>
          )}

          {!isLoading && !!error && (
            <ThemedText style={styles.message}>
              Neizdevas ieladet: {error}
            </ThemedText>
          )}

          {!isLoading && !error && !event && (
            <ThemedText style={styles.message}>
              Pasakums netika atrasts.
            </ThemedText>
          )}

          {!!event && (
            <>
              {!!imageUrl ? (
                <ExpoImage
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={120}
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { borderColor: theme.colors.primaryDark },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={26}
                    color={theme.colors.gray800}
                  />
                </View>
              )}

              <View
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.primaryDark,
                  },
                ]}
              >
                <ThemedText
                  variant="small"
                  style={[styles.timeChipText, { color: theme.colors.white }]}
                >
                  {`${start ?? "--:--"}${end ? ` - ${end}` : ""}`}
                </ThemedText>
              </View>

              <ThemedText style={styles.titleText}>
                {event.fields.nosaukums}
              </ThemedText>

              <ThemedText variant="small" style={styles.descriptionText}>
                {event.fields.apraksts?.trim() || "Papildteksts nav pieejams."}
              </ThemedText>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    paddingBottom: 30,
    gap: 10,
  },
  topActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  timeChipText: {
    fontWeight: "700",
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 6,
  },
  descriptionText: {
    lineHeight: 20,
  },
  titleText: {
    fontSize: 28,
    fontFamily: "Inter-Regular",
    textAlign: "left",
    margin: 0,
    padding: 0,
  },
  message: {
    fontSize: 16,
  },
});
