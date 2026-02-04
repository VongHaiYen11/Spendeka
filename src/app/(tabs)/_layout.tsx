import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, usePathname } from 'expo-router';
import React, { useMemo } from 'react';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -1 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  // Dark nav only when on camera tab (opening detail from Home navigates to Camera)
  const isDarkNav = useMemo(() => {
    return pathname?.includes('/camera') ?? false;
  }, [pathname]);

  // Tab bar style: dark when on camera or detail fullscreen, otherwise follow theme
  const tabBarStyle = useMemo(() => {
    if (isDarkNav) {
      return {
        backgroundColor: '#000',
        borderTopColor: 'rgba(255,255,255,0.1)',
      };
    }
    return {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderTopColor: Colors[colorScheme ?? 'light'].border,
    };
  }, [isDarkNav, colorScheme]);

  const tabBarInactiveTintColor = useMemo(() => {
    if (isDarkNav) {
      return '#999';
    }
    return Colors[colorScheme ?? 'light'].tabIconDefault;
  }, [isDarkNav, colorScheme]);

  const tabBarActiveTintColor = useMemo(() => {
    if (isDarkNav) {
      return Colors.dark.tint;
    }
    return Colors[colorScheme ?? 'light'].tint;
  }, [isDarkNav, colorScheme]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <TabBarIcon name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
