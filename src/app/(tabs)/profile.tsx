import {
  ThemedCard,
  ThemedHeader,
  ThemedSpacer,
  ThemedText,
  ThemedView,
} from "../../components";

import { useTheme } from "@shopify/restyle";
import { ScrollView } from "react-native";
import { useThemeMode } from "../../providers/ThemeProvider";
import { Theme } from "../../theme";

// Funkcija, kas aprēķina luminanci un nosaka, vai krāsa ir tumša vai gaiša
function isColorDark(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // Perceptuālā luminance (cilvēka acs jutība)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance < 150; // zem 150 → tumšs fons
}

export default function Profile() {
  const { toggle, mode } = useThemeMode();
  const theme = useTheme<Theme>();

  const colorKeys = Object.keys(theme.colors) as (keyof Theme["colors"])[];

  return (
    <ThemedView style={{ padding: 20 }}>
      <ScrollView>
        <ThemedHeader color="text">Krāsu Palete</ThemedHeader>
        <ThemedSpacer size="s" />

        {colorKeys.map((key) => {
          const bg = theme.colors[key];
          const dark = isColorDark(bg);

          return (
            <ThemedCard
              key={key}
              style={{
                backgroundColor: bg,
                marginBottom: theme.spacing.s,
                padding: theme.spacing.s,
              }}
            >
              <ThemedText
                variant="body"
                style={{
                  color: dark ? theme.colors.white : theme.colors.black,
                }}
              >
                {key}: {bg}
              </ThemedText>
            </ThemedCard>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}
