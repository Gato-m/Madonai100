import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedCard, ThemedText, ThemedView } from "../../components";
import { useEvents } from "../../hooks/useAirtable";
import { Theme } from "../../theme";

const chipDateFormatter = new Intl.DateTimeFormat("lv-LV", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const eventTimeFormatter = new Intl.DateTimeFormat("lv-LV", {
  hour: "2-digit",
  minute: "2-digit",
});

function toDateKey(dateString?: string): string | null {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatEventTime(dateString?: string): string | null {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return eventTimeFormatter.format(parsed);
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { events, isLoading, error, refetch } = useEvents();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    const uniqueDates = new Set<string>();

    events.forEach((event) => {
      const eventDate = toDateKey(event.fields.sākums);
      if (eventDate) uniqueDates.add(eventDate);
    });

    return Array.from(uniqueDates).sort((a, b) => a.localeCompare(b));
  }, [events]);

  useEffect(() => {
    if (!availableDates.length) {
      setSelectedDate(null);
      return;
    }

    if (!selectedDate || !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;

    return events.filter(
      (event) => toDateKey(event.fields.sākums) === selectedDate,
    );
  }, [events, selectedDate]);

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.chipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {availableDates.map((dateKey) => {
            const isActive = selectedDate === dateKey;
            const chipDate = new Date(`${dateKey}T00:00:00`);

            return (
              <Pressable
                key={dateKey}
                onPress={() => setSelectedDate(dateKey)}
                style={[
                  styles.chip,
                  {
                    borderColor: theme.colors.primaryDark,
                    backgroundColor: isActive
                      ? theme.colors.accent
                      : theme.colors.primary,
                  },
                ]}
              >
                <ThemedText
                  variant="small"
                  style={{
                    color: isActive ? theme.colors.white : theme.colors.text,
                  }}
                >
                  {chipDateFormatter.format(chipDate)}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => {
          const start = formatEventTime(item.fields.sākums);
          const end = formatEventTime(item.fields.beigas);
          const timeLabel = `${start ?? "--:--"}${end ? ` - ${end}` : ""}`;

          return (
            <ThemedCard
              onPress={() =>
                router.push({
                  pathname: "/(modals)/event",
                  params: { id: item.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.fields.nosaukums}`}
              style={[
                styles.eventCard,
                { borderColor: theme.colors.primaryDark, borderWidth: 1 },
              ]}
            >
              <View style={styles.eventContentRow}>
                <View style={styles.eventMainColumn}>
                  <View
                    style={[
                      styles.timeRow,
                      {
                        backgroundColor: theme.colors.accent,
                        borderColor: theme.colors.primaryDark,
                      },
                    ]}
                  >
                    <ThemedText
                      variant="small"
                      style={[
                        styles.timeLabelText,
                        { color: theme.colors.white },
                      ]}
                    >
                      {timeLabel}
                    </ThemedText>
                  </View>

                  <ThemedText style={styles.eventTitle}>
                    {item.fields.nosaukums}
                  </ThemedText>
                </View>

                <View style={styles.eventRightColumn}>
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={[
                        styles.circleButton,
                        {
                          borderColor: theme.colors.gray400,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Open event map"
                    >
                      <Ionicons
                        name="map-outline"
                        size={16}
                        color={theme.colors.accent}
                      />
                    </Pressable>

                    <Pressable
                      style={[
                        styles.circleButton,
                        {
                          borderColor: theme.colors.gray400,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Set event timer"
                    >
                      <Ionicons
                        name="timer-outline"
                        size={16}
                        color={theme.colors.accent}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </ThemedCard>
          );
        }}
        ListEmptyComponent={
          <ThemedCard
            style={[
              styles.eventCard,
              { borderColor: theme.colors.primaryDark, borderWidth: 1 },
            ]}
          >
            <ThemedText variant="small" style={{ color: theme.colors.text }}>
              {error
                ? `Neizdevās ielādēt pasākumus: ${error}`
                : "Šajā datumā pasākumu nav."}
            </ThemedText>
          </ThemedCard>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chipsRow: {
    marginTop: 10,
    marginBottom: 12,
  },
  chipsContent: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  listContent: {
    paddingBottom: 140,
    gap: 10,
  },
  eventCard: {
    borderRadius: 14,
  },
  eventContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  eventMainColumn: {
    flex: 1,
    gap: 6,
  },
  eventRightColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
  },
  eventTitle: {
    fontSize: 18,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  timeLabelText: {
    fontWeight: "700",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  circleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
