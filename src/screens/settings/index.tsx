import { SafeView, Text, View } from "@/components/Themed";
import { auth, db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAvatarUrl,
  useDisplayName,
  useUserProfile,
} from "@/contexts/UserProfileContext";
import { usePrimaryColor, useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import {
  getReminderSettings,
  updateReminderNotification,
} from "@/services/NotificationService";
import { clearAllExpenses } from "@/services/TransactionService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import TimePickerModal from "./components/TimePickerModal";

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
  const displayName = useDisplayName();
  const avatarUrl = useAvatarUrl();
  const { refreshProfile } = useUserProfile();
  const router = useRouter();
  const [accentModalVisible, setAccentModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useI18n();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
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
  const [newPasswordMatch, setNewPasswordMatch] = useState<boolean | null>(
    null,
  );

  // Refetch profile when Settings screen is focused (e.g. after saving in personal-info)
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  // Load reminder settings
  useEffect(() => {
    const loadReminderSettings = async () => {
      const settings = await getReminderSettings();
      setReminderEnabled(settings.enabled);
      setReminderHour(settings.hour);
      setReminderMinute(settings.minute);
    };
    loadReminderSettings();
  }, []);

  const handleReminderToggle = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    await updateReminderNotification(enabled, reminderHour, reminderMinute);
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    setReminderHour(hour);
    setReminderMinute(minute);
    if (reminderEnabled) {
      await updateReminderNotification(true, hour, minute);
    }
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t("settings.deleteAll.confirmTitle"),
      t("settings.deleteAll.confirmMessage"),
      [
        { text: t("settings.deleteAll.cancel"), style: "cancel" },
        {
          text: t("settings.deleteAll.confirm"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await clearAllExpenses();
              await reloadTransactions();
              Alert.alert(
                t("settings.deleteAll.doneTitle"),
                t("settings.deleteAll.doneMessage"),
              );
            } catch (err) {
              Alert.alert(
                t("settings.deleteAll.errorTitle"),
                t("settings.deleteAll.errorMessage"),
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
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
        t("settings.password.error.cannotChange"),
        t("settings.password.error.cannotChangeMessage"),
      );
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert(
        t("settings.password.error.missingInfo"),
        t("settings.password.error.fillAllFields"),
      );
      return;
    }

    if (currentPasswordValid !== true) {
      Alert.alert(
        t("settings.password.error.cannotChange"),
        t("settings.password.error.confirmFirst"),
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t("settings.password.error.invalidPassword"),
        t("settings.password.error.minLength"),
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert(
        t("settings.password.error.invalidPassword"),
        t("settings.password.error.mismatch"),
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      // We already reauthenticated on blur, but do it again for safety.
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);

      Alert.alert(
        t("settings.password.success.title"),
        t("settings.password.success.message"),
      );
      setPasswordModalVisible(false);
      resetPasswordForm();
    } catch (e: any) {
      const code = e?.code as string | undefined;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        Alert.alert(
          t("settings.password.error.cannotChange"),
          t("settings.password.error.incorrect"),
        );
      } else if (code === "auth/too-many-requests") {
        Alert.alert(
          t("settings.password.error.cannotChange"),
          t("settings.password.error.tooManyAttempts"),
        );
      } else if (code === "auth/requires-recent-login") {
        Alert.alert(
          t("settings.password.error.cannotChange"),
          t("settings.password.error.retryLogin"),
        );
      } else {
        Alert.alert(
          t("settings.password.error.cannotChange"),
          t("settings.password.error.updateFailed"),
        );
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
      setCurrentPasswordError(t("settings.password.error.loginRequired"));
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
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        setCurrentPasswordValid(false);
        setCurrentPasswordError(t("settings.password.error.incorrect"));
      } else if (code === "auth/too-many-requests") {
        setCurrentPasswordValid(false);
        setCurrentPasswordError(t("settings.password.error.tooManyAttempts"));
      } else {
        setCurrentPasswordValid(false);
        setCurrentPasswordError(t("settings.password.error.verifyFailed"));
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
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (err) {
            Alert.alert("Error", "Could not sign out. Please try again.");
          }
        },
      },
    ]);
  };

  // Colors based on theme
  const itemBg = colorScheme === "dark" ? "#1c1c1e" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const secondaryTextColor = colorScheme === "dark" ? "#8e8e93" : "#666";
  const separatorColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e5e5";
  const modalCardBg = colorScheme === "dark" ? "#111827" : "#fff";
  const inputBg = colorScheme === "dark" ? "#0b1220" : "#f3f4f6";
  const inputBorder =
    colorScheme === "dark" ? "rgba(255,255,255,0.12)" : "#e5e7eb";
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
    onToggle?: (value: boolean) => void | Promise<void>;
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
      <Text style={[styles.header, { color: textColor }]}>
        {t("settings.title")}
      </Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: itemBg }]}
            activeOpacity={0.7}
            onPress={() => router.push("/personal-info")}
          >
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={32} color="#fff" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>
                {displayName || "User"}
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
            {t("settings.section.account")}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="lock-closed-outline"
              iconColor={iconBg.password}
              title={t("settings.item.password")}
              hasArrow
              onPress={openPasswordModal}
            />
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <SettingItem
              icon="log-out-outline"
              iconColor={iconBg.signOut}
              title={t("settings.item.signOut")}
              hasArrow
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            {t("settings.section.appearance")}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="moon"
              iconColor="#4A5568"
              title={t("settings.item.darkMode")}
              hasToggle
              toggleValue={isDarkMode}
              onToggle={(_value) => toggleDarkMode()}
            />
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <SettingItem
              icon="color-palette-outline"
              iconColor={iconBg.accent}
              title={t("settings.item.accentColor")}
              hasArrow
              onPress={() => setAccentModalVisible(true)}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            {t("settings.section.notifications")}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="notifications-outline"
              iconColor={iconBg.notification}
              title={t("settings.reminder.enabled")}
              hasToggle
              toggleValue={reminderEnabled}
              onToggle={handleReminderToggle}
            />
            {reminderEnabled && (
              <>
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: separatorColor },
                  ]}
                />
                <TouchableOpacity
                  style={[styles.settingItem, { backgroundColor: itemBg }]}
                  onPress={() => setTimePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: iconBg.notification },
                    ]}
                  >
                    <Ionicons name="time-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, { color: textColor }]}>
                      {t("settings.reminder.title")}
                    </Text>
                    <Text
                      style={[
                        styles.settingSubtitle,
                        { color: secondaryTextColor },
                      ]}
                    >
                      {formatTime(reminderHour, reminderMinute)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={secondaryTextColor}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Language & Region */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secondaryTextColor }]}>
            {t("settings.section.language")}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <View
              style={[
                styles.settingItem,
                styles.languageRow,
                { backgroundColor: itemBg },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconBg.language },
                ]}
              >
                <Ionicons name="globe-outline" size={20} color="#fff" />
              </View>
              <Text style={[styles.settingTitle, { color: textColor }]}>
                {t("settings.item.appLanguage")}
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
            {t("settings.section.data")}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: itemBg }]}>
            <SettingItem
              icon="trash-outline"
              iconColor="#FF3B30"
              title={
                isDeleting
                  ? `${t("settings.item.deleteAllData")}…`
                  : t("settings.item.deleteAllData")
              }
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

      <TimePickerModal
        visible={timePickerVisible}
        hour={reminderHour}
        minute={reminderMinute}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={handleTimeChange}
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
              {t("settings.password.title")}
            </Text>

            <Text style={[styles.modalLabel, { color: secondaryTextColor }]}>
              {t("settings.password.currentPassword")}
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
                placeholder={t("settings.password.placeholder.current")}
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
              {t("settings.password.newPassword")}
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!isChangingPassword}
              placeholder={t("settings.password.placeholder.new")}
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
              {t("settings.password.confirmPassword")}
            </Text>
            <TextInput
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              editable={!isChangingPassword}
              placeholder={t("settings.password.placeholder.confirm")}
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
                {t("settings.password.error.mismatch")}
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
                  {t("settings.password.button.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: primaryColor,
                    opacity:
                      isChangingPassword || currentPasswordValid !== true
                        ? 0.6
                        : 1,
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
                    {t("settings.password.button.update")}
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
    overflow: "hidden",
  },
  avatarImage: {
    width: 60,
    height: 60,
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
  settingContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
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
