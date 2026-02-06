import { SafeView, Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { usePrimaryColor, useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth } from "@/config/firebaseConfig";
import { clearAllExpenses } from "@/services/TransactionService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AccentColorPickerModal from "./components/AccentColorPickerModal";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

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
  const { logout, user } = useAuth();
  const router = useRouter();
  const [accentModalVisible, setAccentModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCheckingCurrentPassword, setIsCheckingCurrentPassword] =
    useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<
    boolean | null
  >(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [currentPasswordCheckSeq, setCurrentPasswordCheckSeq] = useState(0);
  const lastCheckedCurrentPasswordRef = useRef<string | null>(null);
  const checkCurrentPasswordRequestIdRef = useRef(0);
  const currentPasswordDebounceTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const newPasswordMatchDebounceTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [newPasswordMatch, setNewPasswordMatch] = useState<boolean | null>(null);

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

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsCheckingCurrentPassword(false);
    setCurrentPasswordValid(null);
    setCurrentPasswordError(null);
    setCurrentPasswordCheckSeq(0);
    setNewPasswordMatch(null);
    lastCheckedCurrentPasswordRef.current = null;
    if (currentPasswordDebounceTimerRef.current) {
      clearTimeout(currentPasswordDebounceTimerRef.current);
      currentPasswordDebounceTimerRef.current = null;
    }
    if (newPasswordMatchDebounceTimerRef.current) {
      clearTimeout(newPasswordMatchDebounceTimerRef.current);
      newPasswordMatchDebounceTimerRef.current = null;
    }
  };

  const openPasswordModal = () => {
    resetPasswordForm();
    setPasswordModalVisible(true);
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    setPasswordModalVisible(false);
    resetPasswordForm();
  };

  const handleChangePassword = async () => {
    const firebaseUser = auth.currentUser;
    const email = firebaseUser?.email ?? user?.email ?? null;

    if (!firebaseUser || !email) {
      Alert.alert(
        "Error",
        "Your account cannot change password right now. Please log in again."
      );
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Missing info", "Please fill in all password fields.");
      return;
    }

    if (currentPasswordValid !== true) {
      Alert.alert("Error", "Please confirm your current password first.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Invalid password", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Password mismatch", "New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // We already reauthenticated on blur, but do it again for safety.
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);

      Alert.alert("Success", "Password updated successfully.");
      setPasswordModalVisible(false);
      resetPasswordForm();
    } catch (e: any) {
      const code = e?.code as string | undefined;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert(
          "Error",
          "Too many attempts. Please wait a few minutes and try again."
        );
      } else if (code === "auth/requires-recent-login") {
        Alert.alert("Error", "Please log in again and retry changing password.");
      } else {
        Alert.alert("Error", "Could not update password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const checkCurrentPasswordNow = async (passwordToCheck: string) => {
    const trimmed = passwordToCheck;
    if (!trimmed) return;

    if (lastCheckedCurrentPasswordRef.current === trimmed) {
      return;
    }

    const firebaseUser = auth.currentUser;
    const email = firebaseUser?.email ?? user?.email ?? null;
    if (!firebaseUser || !email) {
      setCurrentPasswordValid(false);
      setCurrentPasswordError("Please log in again to verify password.");
      return;
    }

    const requestId = ++checkCurrentPasswordRequestIdRef.current;
    setIsCheckingCurrentPassword(true);
    setCurrentPasswordError(null);
    setCurrentPasswordValid(null);
    setCurrentPasswordCheckSeq((v) => v + 1);

    try {
      const credential = EmailAuthProvider.credential(email, trimmed);
      await reauthenticateWithCredential(firebaseUser, credential);
      if (requestId !== checkCurrentPasswordRequestIdRef.current) return;
      lastCheckedCurrentPasswordRef.current = trimmed;
      setCurrentPasswordValid(true);
      setCurrentPasswordError(null);
    } catch (e: any) {
      if (requestId !== checkCurrentPasswordRequestIdRef.current) return;
      const code = e?.code as string | undefined;
      lastCheckedCurrentPasswordRef.current = null;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setCurrentPasswordValid(false);
        setCurrentPasswordError("Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        setCurrentPasswordValid(false);
        setCurrentPasswordError(
          "Too many attempts. Please wait a few minutes and try again."
        );
      } else {
        setCurrentPasswordValid(false);
        setCurrentPasswordError("Could not verify current password.");
      }
    } finally {
      if (requestId === checkCurrentPasswordRequestIdRef.current) {
        setIsCheckingCurrentPassword(false);
      }
    }
  };

  // Debounce current password verification (wait user stops typing)
  useEffect(() => {
    if (!passwordModalVisible) return;

    if (currentPasswordDebounceTimerRef.current) {
      clearTimeout(currentPasswordDebounceTimerRef.current);
      currentPasswordDebounceTimerRef.current = null;
    }

    if (!currentPassword) {
      setCurrentPasswordValid(null);
      setCurrentPasswordError(null);
      lastCheckedCurrentPasswordRef.current = null;
      return;
    }

    setIsCheckingCurrentPassword(true);
    currentPasswordDebounceTimerRef.current = setTimeout(() => {
      checkCurrentPasswordNow(currentPassword);
    }, 650);

    return () => {
      if (currentPasswordDebounceTimerRef.current) {
        clearTimeout(currentPasswordDebounceTimerRef.current);
        currentPasswordDebounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPassword, passwordModalVisible]);

  // Debounce "new password matches confirm" check
  useEffect(() => {
    if (!passwordModalVisible) return;

    if (newPasswordMatchDebounceTimerRef.current) {
      clearTimeout(newPasswordMatchDebounceTimerRef.current);
      newPasswordMatchDebounceTimerRef.current = null;
    }

    if (!newPassword && !confirmNewPassword) {
      setNewPasswordMatch(null);
      return;
    }

    newPasswordMatchDebounceTimerRef.current = setTimeout(() => {
      if (!confirmNewPassword) {
        setNewPasswordMatch(null);
        return;
      }
      setNewPasswordMatch(newPassword === confirmNewPassword);
    }, 450);

    return () => {
      if (newPasswordMatchDebounceTimerRef.current) {
        clearTimeout(newPasswordMatchDebounceTimerRef.current);
        newPasswordMatchDebounceTimerRef.current = null;
      }
    };
  }, [newPassword, confirmNewPassword, passwordModalVisible]);

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
  const modalCardBg = colorScheme === "dark" ? "#111827" : "#fff";
  const inputBg = colorScheme === "dark" ? "#0b1220" : "#f3f4f6";
  const inputBorder = colorScheme === "dark" ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const errorRed = "#EF4444";
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
              onPress={openPasswordModal}
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

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePasswordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, { backgroundColor: modalCardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Change password
            </Text>

            <Text style={[styles.modalLabel, { color: secondaryTextColor }]}>
              Current password
            </Text>
            <View>
              <TextInput
                value={currentPassword}
                onChangeText={(v) => {
                  setCurrentPassword(v);
                  setCurrentPasswordValid(null);
                  setCurrentPasswordError(null);
                  lastCheckedCurrentPasswordRef.current = null;
                }}
                secureTextEntry
                editable={!isChangingPassword}
                placeholder="Enter current password"
                placeholderTextColor={secondaryTextColor}
                style={[
                  styles.modalInput,
                  styles.modalInputWithIcon,
                  {
                    backgroundColor: inputBg,
                    borderColor:
                      currentPasswordValid === false ? errorRed : inputBorder,
                    color: textColor,
                  },
                ]}
              />

              <View style={styles.modalInputIconRight}>
                {isCheckingCurrentPassword ? (
                  <ActivityIndicator size="small" color={secondaryTextColor} />
                ) : currentPasswordValid === true ? (
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                ) : null}
              </View>
            </View>

            {currentPasswordValid === false && currentPasswordError ? (
              <Text style={[styles.modalErrorText, { color: errorRed }]}>
                {currentPasswordError}
              </Text>
            ) : null}

            <Text style={[styles.modalLabel, { color: secondaryTextColor }]}>
              New password
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!isChangingPassword}
              placeholder="Enter new password"
              placeholderTextColor={secondaryTextColor}
              style={[
                styles.modalInput,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor,
                },
              ]}
            />

            <Text style={[styles.modalLabel, { color: secondaryTextColor }]}>
              Confirm new password
            </Text>
            <TextInput
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              editable={!isChangingPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={secondaryTextColor}
              style={[
                styles.modalInput,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor,
                },
              ]}
            />

            {newPasswordMatch === false ? (
              <Text style={[styles.modalErrorText, { color: errorRed }]}>
                New passwords do not match.
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={closePasswordModal}
                disabled={isChangingPassword}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: textColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: primaryColor,
                    opacity:
                      isChangingPassword || currentPasswordValid !== true ? 0.6 : 1,
                  },
                ]}
                onPress={handleChangePassword}
                disabled={isChangingPassword || currentPasswordValid !== true}
                activeOpacity={0.8}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalInputWithIcon: {
    paddingRight: 40,
  },
  modalInputIconRight: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modalErrorText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
