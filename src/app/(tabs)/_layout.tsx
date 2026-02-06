import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -1 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const primaryColor = usePrimaryColor();
  const pathname = usePathname();
  const router = useRouter();

  // Dark nav only when on camera tab (opening detail from Home navigates to Camera)
  const isDarkNav = useMemo(() => {
    return pathname?.includes("/camera") ?? false;
  }, [pathname]);

  // Tab bar style: dark when on camera or detail fullscreen, otherwise follow theme
  const tabBarStyle = useMemo(() => {
    if (isDarkNav) {
      return {
        backgroundColor: "#000",
        borderTopColor: "rgba(255,255,255,0.1)",
      };
    }
    return {
      backgroundColor: Colors[colorScheme ?? "light"].background,
      borderTopColor: Colors[colorScheme ?? "light"].border,
    };
  }, [isDarkNav, colorScheme]);

  const tabBarInactiveTintColor = useMemo(() => {
    if (isDarkNav) {
      return "#999";
    }
    return Colors[colorScheme ?? "light"].tabIconDefault;
  }, [isDarkNav, colorScheme]);

  const tabBarActiveTintColor = useMemo(() => {
    return primaryColor;
  }, [primaryColor]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dump"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          // Custom center floating button – navigate to add-transaction (do not switch to dump tab)
          tabBarButton: (props: BottomTabBarButtonProps) => (
            <TouchableOpacity
              {...(props as TouchableOpacityProps)}
              onPress={() => {
                router.push({ pathname: "/add-transaction" });
              }}
              activeOpacity={0.9}
              style={[
                props.style,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  top: -20,
                },
              ]}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: primaryColor,
                  justifyContent: "center",
                  alignItems: "center",
                  // Shadow for iOS
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  // Elevation for Android
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "400",
                    color: "#fff",
                    lineHeight: 30,
                  }}
                >
                  +
                </Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color }) => <TabBarIcon name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
