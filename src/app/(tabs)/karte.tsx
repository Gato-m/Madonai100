import { useEvents } from "@/hooks/useAirtable";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shopify/restyle";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";
import { SvgXml } from "react-native-svg";
import { WebView } from "react-native-webview";
import { Theme } from "../../theme";

const SIMPLE_TILE_URL =
  "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

const MARKER_WIDTH = 32;
const MARKER_HEIGHT = 42;
const SMALL_MARKER_SCALE = 0.82;
const CLUSTERING_LAT_DELTA_THRESHOLD = 0.05;
const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.34);

const eventTimeFormatter = new Intl.DateTimeFormat("lv-LV", {
  hour: "2-digit",
  minute: "2-digit",
});

const eventDateFormatter = new Intl.DateTimeFormat("lv-LV", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const MARKER_ICON_BY_TYPE = {
  default:
    '<rect x="5" y="6" width="14" height="12" rx="2" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="5" y1="10" x2="19" y2="10" stroke="#ffffff" stroke-width="2"/><line x1="9" y1="4" x2="9" y2="8" stroke="#ffffff" stroke-width="2"/><line x1="15" y1="4" x2="15" y2="8" stroke="#ffffff" stroke-width="2"/>',
  music:
    '<g transform="translate(2 0)"><path d="M16 5v10.5a2.5 2.5 0 1 1-2-2.45V7.8l-6 1.5v5.7a2.5 2.5 0 1 1-2-2.45V7l10-2z" fill="#ffffff"/></g>',
  cinema:
    '<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="#ffffff" stroke-width="2"/><polygon points="10,10 15,12 10,14" fill="#ffffff"/>',
  sport:
    '<circle cx="12" cy="12" r="6" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M12 6a6 6 0 0 0 0 12M12 6a6 6 0 0 1 0 12M6 12h12" fill="none" stroke="#ffffff" stroke-width="1.7"/>',
  food: '<path d="M7 6v6M9 6v6M11 6v6M9 12v6M16 6v12M16 6c2 2 2 5 0 7" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>',
  art: '<polygon points="12,6 14.2,10.3 19,10.9 15.5,14.2 16.4,19 12,16.7 7.6,19 8.5,14.2 5,10.9 9.8,10.3" fill="#ffffff"/>',
} as const;

type MarkerIconType = keyof typeof MARKER_ICON_BY_TYPE;

function resolveMarkerIconType(category?: string): MarkerIconType {
  const normalized = (category ?? "").toLowerCase();

  if (
    normalized.includes("koncert") ||
    normalized.includes("muz") ||
    normalized.includes("music") ||
    normalized.includes("dj")
  ) {
    return "music";
  }

  if (normalized.includes("kino") || normalized.includes("film")) {
    return "cinema";
  }

  if (normalized.includes("sport")) {
    return "sport";
  }

  if (
    normalized.includes("edien") ||
    normalized.includes("food") ||
    normalized.includes("cafe") ||
    normalized.includes("kafe") ||
    normalized.includes("tirgus")
  ) {
    return "food";
  }

  if (
    normalized.includes("maksla") ||
    normalized.includes("izrade") ||
    normalized.includes("teatr") ||
    normalized.includes("deja") ||
    normalized.includes("dance")
  ) {
    return "art";
  }

  return "default";
}

function formatEventTime(dateString?: string): string | null {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return eventTimeFormatter.format(parsed);
}

function formatEventDate(dateString?: string): string | null {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return eventDateFormatter.format(parsed);
}

function buildMarkerSvg(iconType: MarkerIconType): string {
  const iconSvg = MARKER_ICON_BY_TYPE[iconType] ?? MARKER_ICON_BY_TYPE.default;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48">
  <g transform="translate(18 15) scale(1.12) translate(-18 -15)">
    <path fill="#f19020" stroke="#ffffff" stroke-width="1.8" d="M18 2C10.82 2 5 7.82 5 15c0 10.48 10.58 22.44 12.27 24.3.4.45 1.07.45 1.47 0C20.42 37.44 31 25.48 31 15 31 7.82 25.18 2 18 2z"/>
  </g>
  <g transform="translate(6 4)">${iconSvg}</g>
</svg>`;
}

const MAP_CENTER = {
  latitude: 56.8521,
  longitude: 26.215,
};

const INITIAL_REGION = {
  latitude: MAP_CENTER.latitude,
  longitude: MAP_CENTER.longitude,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const INITIAL_ZOOM = 16;

type EventMarker = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  iconType: MarkerIconType;
  description: string | undefined;
  category: string | undefined;
  start: string | undefined;
  end: string | undefined;
};

type ClusteredItem =
  | {
      kind: "event";
      id: string;
      event: EventMarker;
      latitude: number;
      longitude: number;
    }
  | {
      kind: "cluster";
      id: string;
      latitude: number;
      longitude: number;
      count: number;
    };

function buildClusteredItems(
  markers: EventMarker[],
  region: Region,
): ClusteredItem[] {
  if (region.latitudeDelta < CLUSTERING_LAT_DELTA_THRESHOLD) {
    return markers.map((event) => ({
      kind: "event",
      id: event.id,
      event,
      latitude: event.latitude,
      longitude: event.longitude,
    }));
  }

  const cellSize = Math.max(region.latitudeDelta / 8, 0.004);
  const buckets = new Map<
    string,
    { latitudeSum: number; longitudeSum: number; events: EventMarker[] }
  >();

  markers.forEach((event) => {
    const latCell = Math.floor(event.latitude / cellSize);
    const lngCell = Math.floor(event.longitude / cellSize);
    const key = `${latCell}:${lngCell}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.latitudeSum += event.latitude;
      existing.longitudeSum += event.longitude;
      existing.events.push(event);
      return;
    }

    buckets.set(key, {
      latitudeSum: event.latitude,
      longitudeSum: event.longitude,
      events: [event],
    });
  });

  const result: ClusteredItem[] = [];

  buckets.forEach((bucket, key) => {
    if (bucket.events.length === 1) {
      const onlyEvent = bucket.events[0];
      result.push({
        kind: "event",
        id: onlyEvent.id,
        event: onlyEvent,
        latitude: onlyEvent.latitude,
        longitude: onlyEvent.longitude,
      });
      return;
    }

    result.push({
      kind: "cluster",
      id: `cluster-${key}`,
      latitude: bucket.latitudeSum / bucket.events.length,
      longitude: bucket.longitudeSum / bucket.events.length,
      count: bucket.events.length,
    });
  });

  return result;
}

function buildAndroidLeafletHtml(markers: EventMarker[]): string {
  const markersJson = JSON.stringify(markers);
  const markerIcons = {
    default: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("default"))}`,
    music: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("music"))}`,
    cinema: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("cinema"))}`,
    sport: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("sport"))}`,
    food: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("food"))}`,
    art: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg("art"))}`,
  };

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.2, maximum-scale=1.2, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      .cluster-pill {
        width: 34px;
        height: 34px;
        border-radius: 17px;
        background: #f19020;
        border: 2px solid #ffffff;
        color: #ffffff;
        font-weight: 700;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <script>
      const markers = ${markersJson};
      const markerIcons = ${JSON.stringify(markerIcons)};
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      }).setView([${MAP_CENTER.latitude}, ${MAP_CENTER.longitude}], ${INITIAL_ZOOM});

      window.resetMapView = () => {
        map.setView([${MAP_CENTER.latitude}, ${MAP_CENTER.longitude}], ${INITIAL_ZOOM}, { animate: true });
      };

      L.tileLayer('${SIMPLE_TILE_URL}', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markerClusterGroup = L.markerClusterGroup({
        disableClusteringAtZoom: 14,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 42,
        iconCreateFunction: (cluster) => {
          return L.divIcon({
            html: '<div class="cluster-pill">' + cluster.getChildCount() + '</div>',
            className: 'cluster-wrapper',
            iconSize: [34, 34]
          });
        }
      });

      markers.forEach((item) => {
        const iconUrl = markerIcons[item.iconType] || markerIcons.default;
        const markerIcon = L.icon({
          iconUrl,
          iconSize: [${MARKER_WIDTH}, ${MARKER_HEIGHT}],
          iconAnchor: [${MARKER_WIDTH / 2}, ${MARKER_HEIGHT}],
          tooltipAnchor: [0, -36]
        });

        const marker = L.marker([item.latitude, item.longitude], {
          icon: markerIcon
        });

        marker.on('click', () => {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              id: item.id
            }));
          }
        });

        if (item.title) {
          marker.bindTooltip(item.title, {
            direction: 'top',
            offset: [0, -8],
            opacity: 0.9
          });
        }

        markerClusterGroup.addLayer(marker);
      });

      map.addLayer(markerClusterGroup);
    </script>
  </body>
</html>
`;
}

export default function MapScreen() {
  const { events } = useEvents();
  const theme = useTheme<Theme>();
  const mapRef = useRef<MapView | null>(null);
  const webViewRef = useRef<WebView | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(INITIAL_REGION);
  const [displayedEvent, setDisplayedEvent] = useState<EventMarker | null>(
    null,
  );
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const eventMarkers = useMemo<EventMarker[]>(() => {
    return events
      .map((event) => {
        const latitude = Number(event.fields.lokacija_lat);
        const longitude = Number(event.fields.lokacija_lng);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          id: event.id,
          title: event.fields.nosaukums ?? "Pasakums",
          latitude,
          longitude,
          iconType: resolveMarkerIconType(event.fields.kategorija),
          description: event.fields.apraksts,
          category: event.fields.kategorija,
          start: event.fields.sākums,
          end: event.fields.beigas,
        };
      })
      .filter((marker): marker is EventMarker => marker !== null);
  }, [events]);

  const androidLeafletHtml = useMemo(
    () => buildAndroidLeafletHtml(eventMarkers),
    [eventMarkers],
  );

  const clusteredItems = useMemo(
    () => buildClusteredItems(eventMarkers, currentRegion),
    [eventMarkers, currentRegion],
  );

  const handleResetView = useCallback(() => {
    if (Platform.OS === "android") {
      webViewRef.current?.injectJavaScript(
        "window.resetMapView && window.resetMapView(); true;",
      );
      return;
    }

    mapRef.current?.animateToRegion(INITIAL_REGION, 300);
  }, []);

  const handleMapMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          id?: string;
        };

        if (payload.type !== "markerPress" || !payload.id) return;

        const tappedEvent = eventMarkers.find((item) => item.id === payload.id);
        if (tappedEvent) {
          setDisplayedEvent(tappedEvent);

          if (!isSheetVisible) {
            setIsSheetVisible(true);
            sheetTranslateY.setValue(SHEET_HEIGHT);
            Animated.timing(sheetTranslateY, {
              toValue: 0,
              duration: 260,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start();
          }
        }
      } catch {
        // Ignore malformed messages from web content.
      }
    },
    [eventMarkers, isSheetVisible, sheetTranslateY],
  );

  const openEventSheet = useCallback(
    (event: EventMarker) => {
      setDisplayedEvent(event);

      if (!isSheetVisible) {
        setIsSheetVisible(true);
        sheetTranslateY.setValue(SHEET_HEIGHT);
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    },
    [isSheetVisible, sheetTranslateY],
  );

  const closeEventSheet = useCallback(() => {
    if (!isSheetVisible) return;

    Animated.timing(sheetTranslateY, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSheetVisible(false);
      setDisplayedEvent(null);
      sheetTranslateY.setValue(SHEET_HEIGHT);
    });
  }, [isSheetVisible, sheetTranslateY]);

  const eventStart = formatEventTime(displayedEvent?.start);
  const eventEnd = formatEventTime(displayedEvent?.end);
  const eventDate = formatEventDate(displayedEvent?.start);
  const eventTimeLabel = `${eventStart ?? "--:--"}${eventEnd ? ` - ${eventEnd}` : ""}`;

  if (Platform.OS === "android") {
    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          originWhitelist={["*"]}
          source={{ html: androidLeafletHtml }}
          onMessage={handleMapMessage}
        />
        <Pressable
          onPress={handleResetView}
          style={styles.resetButton}
          accessibilityRole="button"
          accessibilityLabel="Reset map view"
        >
          <Ionicons name="contract-outline" size={20} color="#1f2937" />
        </Pressable>
        {isSheetVisible && !!displayedEvent && (
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: "#ffffff",
                borderColor: theme.colors.primaryDark,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTopRow}>
              <Text
                style={[styles.sheetDateText, { color: theme.colors.gray800 }]}
              >
                {eventDate ?? "Datums nav pieejams"}
              </Text>
              <Pressable
                onPress={closeEventSheet}
                style={[
                  styles.sheetCloseButton,
                  {
                    borderColor: theme.colors.gray400,
                    backgroundColor: "#ffffff",
                  },
                ]}
              >
                <Ionicons
                  name="close-outline"
                  size={18}
                  color={theme.colors.accent}
                />
              </Pressable>
            </View>
            <View
              style={[
                styles.timeChip,
                {
                  backgroundColor: theme.colors.accent,
                  borderColor: theme.colors.primaryDark,
                },
              ]}
            >
              <Text
                style={[styles.timeChipText, { color: theme.colors.white }]}
              >
                {eventTimeLabel}
              </Text>
            </View>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              {displayedEvent.title}
            </Text>
            <Text
              style={[styles.sheetDescription, { color: theme.colors.gray800 }]}
            >
              {displayedEvent.description?.trim() ||
                "Papildteksts nav pieejams."}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={setCurrentRegion}
        mapType="standard"
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsIndoors={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        zoomEnabled
        scrollEnabled
      >
        <UrlTile
          urlTemplate={SIMPLE_TILE_URL}
          maximumZ={19}
          flipY={false}
          zIndex={1}
        />
        {clusteredItems.map((item) => {
          if (item.kind === "cluster") {
            return (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                onPress={() => {
                  const nextLatitudeDelta = Math.max(
                    currentRegion.latitudeDelta * 0.55,
                    0.003,
                  );
                  const nextLongitudeDelta = Math.max(
                    currentRegion.longitudeDelta * 0.55,
                    0.003,
                  );

                  mapRef.current?.animateToRegion(
                    {
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: nextLatitudeDelta,
                      longitudeDelta: nextLongitudeDelta,
                    },
                    280,
                  );
                }}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.clusterBubble}>
                  <Text style={styles.clusterBubbleText}>{item.count}</Text>
                </View>
              </Marker>
            );
          }

          const isZoomedOut =
            currentRegion.latitudeDelta >= CLUSTERING_LAT_DELTA_THRESHOLD;
          const markerWidth = isZoomedOut
            ? Math.round(MARKER_WIDTH * SMALL_MARKER_SCALE)
            : MARKER_WIDTH;
          const markerHeight = isZoomedOut
            ? Math.round(MARKER_HEIGHT * SMALL_MARKER_SCALE)
            : MARKER_HEIGHT;

          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.event.title}
              onPress={() => openEventSheet(item.event)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 1 }}
            >
              <SvgXml
                xml={buildMarkerSvg(item.event.iconType)}
                width={markerWidth}
                height={markerHeight}
              />
            </Marker>
          );
        })}
      </MapView>
      <Pressable
        onPress={handleResetView}
        style={styles.resetButton}
        accessibilityRole="button"
        accessibilityLabel="Reset map view"
      >
        <Ionicons name="contract-outline" size={24} color="#1f2937" />
      </Pressable>
      {isSheetVisible && !!displayedEvent && (
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: "#ffffff",
              borderColor: theme.colors.primaryDark,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTopRow}>
            <Text
              style={[styles.sheetDateText, { color: theme.colors.gray800 }]}
            >
              {eventDate ?? "Datums nav pieejams"}
            </Text>
            <Pressable
              onPress={closeEventSheet}
              style={[
                styles.sheetCloseButton,
                {
                  borderColor: theme.colors.gray400,
                  backgroundColor: "#ffffff",
                },
              ]}
            >
              <Ionicons
                name="close-outline"
                size={18}
                color={theme.colors.accent}
              />
            </Pressable>
          </View>
          <View
            style={[
              styles.timeChip,
              {
                backgroundColor: theme.colors.accent,
                borderColor: theme.colors.primaryDark,
              },
            ]}
          >
            <Text style={[styles.timeChipText, { color: theme.colors.white }]}>
              {eventTimeLabel}
            </Text>
          </View>
          <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
            {displayedEvent.title}
          </Text>
          <Text
            style={[styles.sheetDescription, { color: theme.colors.gray800 }]}
          >
            {displayedEvent.description?.trim() || "Papildteksts nav pieejams."}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  resetButton: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 30,
  },
  resetButtonIcon: {
    fontSize: 20,
    color: "#1f2937",
    fontWeight: "700",
    lineHeight: 22,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 40,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 10,
  },
  sheetTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetDateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  clusterBubble: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f19020",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  clusterBubbleText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
