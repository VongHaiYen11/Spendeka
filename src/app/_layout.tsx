import "@/styles/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { AuthProvider } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Giữ cấu trúc bọc của main nhưng thêm AuthProvider của bạn vào
  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <AuthProvider>
        <ThemeProvider>
          <TransactionProvider>
            <ThemedNavigationContainer />
          </TransactionProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function ThemedNavigationContainer() {
  const { colorScheme } = useTheme();

  return (
    <NavigationThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Giữ các màn hình từ feature/auth (index, auth) và main (edit-transaction) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="history"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="edit-transaction"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}