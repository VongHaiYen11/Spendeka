import { SafeView, Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { usePrimaryColor, useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { clearAllExpenses } from "@/services/TransactionService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";
import AccentColorPickerModal from "./components/AccentColorPickerModal";

export default function SettingsScreen() {
  const {
    isDarkMode,
    toggleDarkMode,
    accentKey,
    setAccentKey,
    languageKey,
    setLanguageKey,
  } = useTheme();
  const primaryColor = usePrimaryColor();
  const colorScheme = useColorScheme();
  const { reloadTransactions } = useTransactions();
  const { logout } = useAuth();
  const router = useRouter();
  const [accentModalVisible, setAccentModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently remove all your transactions. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await clearAllExpenses();
              await reloadTransactions();
              Alert.alert("Done", "All data has been deleted.");
            } catch (err) {
              Alert.alert(
                "Error",
                "Could not delete all data. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch (err) {
              Alert.alert(
                "Error",
                "Could not sign out. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Colors based on theme
  const itemBg = colorScheme === "dark" ? "#1c1c1e" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const secondaryTextColor = colorScheme === "dark" ? "#8e8e93" : "#666";
  const separatorColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e5e5";
  const iconBg = {
    profile: "#4A90E2",
    password: "#4A90E2",
    accent: "#8B5CF6",
    notification: "#34C759",
    language: "#4A90E2",
    signOut: "#FF3B30",
  };

  const SettingItem = ({
    icon,
    iconColor,
    title,
    hasArrow = false,
    hasToggle = false,
    toggleValue = false,
    onToggle,
    onPress,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    hasArrow?: boolean;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: itemBg }]}
      onPress={onPress}
      disabled={!onPress && !hasToggle}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={20} color="#fff" />
      </View>
      <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.rightContent}>
        {hasToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: "#767577", true: primaryColor }}
            thumbColor="#fff"
          />
        )}
        {hasArrow && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={secondaryTextColor}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeView style={styles.container}>
      <Text style={[styles.header, { color: textColor }]}>Settings</Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: itemBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>
                User
              </Text>
              <Text
                style={[styles.profileSubtitle, { color: secondaryTextColor }]}
              >
                Edit personal details
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={secondaryTextColor}
            />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            Account
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="person-outline"
              iconColor={iconBg.profile}
              title="Personal Info"
              hasArrow
              onPress={() => {}}
            />
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <SettingItem
              icon="lock-closed-outline"
              iconColor={iconBg.password}
              title="Password"
              hasArrow
              onPress={() => {}}
            />
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <SettingItem
              icon="log-out-outline"
              iconColor={iconBg.signOut}
              title="Sign Out"
              hasArrow
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            Appearance
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="moon"
              iconColor="#4A5568"
              title="Dark Mode"
              hasToggle
              toggleValue={isDarkMode}
              onToggle={toggleDarkMode}
            />
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <SettingItem
              icon="color-palette-outline"
              iconColor={iconBg.accent}
              title="Accent Color"
              hasArrow
              onPress={() => setAccentModalVisible(true)}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            Notifications
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="notifications-outline"
              iconColor={iconBg.notification}
              title="Push Notifications"
              hasToggle
              toggleValue={false}
              onToggle={() => {}}
            />
          </View>
        </View>

        {/* Language & Region */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            Language & Region
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <View
              style={[styles.settingItem, styles.languageRow, { backgroundColor: itemBg }]}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: iconBg.language }]}
              >
                <Ionicons name="globe-outline" size={20} color="#fff" />
              </View>
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Language
              </Text>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    languageKey === "vie" && {
                      backgroundColor: primaryColor,
                    },
                    languageKey !== "vie" && {
                      backgroundColor:
                        colorScheme === "dark" ? "#374151" : "#e5e7ea",
                    },
                  ]}
                  onPress={() => setLanguageKey("vie")}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      {
                        color: languageKey === "vie" ? "#fff" : textColor,
                      },
                    ]}
                  >
                    VIE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    languageKey === "eng" && {
                      backgroundColor: primaryColor,
                    },
                    languageKey !== "eng" && {
                      backgroundColor:
                        colorScheme === "dark" ? "#374151" : "#e5e7ea",
                    },
                  ]}
                  onPress={() => setLanguageKey("eng")}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      {
                        color: languageKey === "eng" ? "#fff" : textColor,
                      },
                    ]}
                  >
                    ENG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            Data
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="trash-outline"
              iconColor="#FF3B30"
              title={isDeleting ? "Deleting…" : "Delete All Data"}
              hasArrow
              onPress={isDeleting ? undefined : handleDeleteAllData}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AccentColorPickerModal
        visible={accentModalVisible}
        currentAccentKey={accentKey}
        onClose={() => setAccentModalVisible(false)}
        onSelect={setAccentKey}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 34,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: "transparent",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
  },
  rightContent: {
    backgroundColor: "transparent",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  languageToggle: {
    flexDirection: "row",
    gap: 6,
  },
  languageOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    marginHorizontal: 0,
    alignSelf: "stretch",
  },
  bottomPadding: {
    height: 8,
    backgroundColor: "transparent",
  },
});
