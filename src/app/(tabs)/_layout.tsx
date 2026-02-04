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

  // Check if currently on camera screen
  const isCameraScreen = useMemo(() => {
    return pathname?.includes('/camera') ?? false;
  }, [pathname]);

  // Tab bar style: always dark when on camera screen, otherwise follow theme
  const tabBarStyle = useMemo(() => {
    if (isCameraScreen) {
      return {
        backgroundColor: '#000',
        borderTopColor: 'rgba(255,255,255,0.1)',
      };
    }
    return {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderTopColor: Colors[colorScheme ?? 'light'].border,
    };
  }, [isCameraScreen, colorScheme]);

  const tabBarInactiveTintColor = useMemo(() => {
    if (isCameraScreen) {
      return '#999';
    }
    return Colors[colorScheme ?? 'light'].tabIconDefault;
  }, [isCameraScreen, colorScheme]);

  const tabBarActiveTintColor = useMemo(() => {
    if (isCameraScreen) {
      return Colors.dark.tint; // Use dark theme tint for camera
    }
    return Colors[colorScheme ?? 'light'].tint;
  }, [isCameraScreen, colorScheme]);

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
