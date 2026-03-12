import { useTheme } from "@shopify/restyle";
import { Tabs } from "expo-router";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarIcon from "../../components/TabBarIcon";
import { ThemeToggleButton } from "../../components/ThemeToggleButton";
import { Theme } from "../../theme";

const tabsBg = require("../../../assets/images/TabsBg.png");
const tabsBgSource = Image.resolveAssetSource(tabsBg);
const tabsBgAspectRatio = tabsBgSource.height / tabsBgSource.width;
const topBg = require("../../../assets/images/TopBg.png");
const topBgSource = Image.resolveAssetSource(topBg);
const topBgAspectRatio = topBgSource.height / topBgSource.width;

export default function TabsLayout() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabBarImageHeight = Math.round(width * tabsBgAspectRatio);
  const tabBarHeight = tabBarImageHeight + insets.bottom;
  const topBgHeight = Math.round(width * topBgAspectRatio);

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: "transparent",
          paddingTop: topBgHeight,
        },
        tabBarStyle: {
          borderTopColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          position: "absolute",
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 45,
          paddingHorizontal: 24,
        },
        tabBarBackground: () => (
          <Image
            source={tabsBg}
            resizeMode="contain"
            style={[
              styles.tabBarBackground,
              { width, height: tabBarImageHeight },
            ]}
          />
        ),
        tabBarActiveTintColor: theme.colors.white,
        tabBarInactiveTintColor: theme.colors.gray800,
        headerTransparent: true,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.text,
        headerRight: () => <ThemeToggleButton />,
        headerRightContainerStyle: {
          paddingRight: 16,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "PROGRAMMA",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "SEARCH",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFILE",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
