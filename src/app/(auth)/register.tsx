import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth, db, storage } from "@/config/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<string>(""); // yyyy-mm-dd
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const passwordMatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Debounce password match check while typing
  useEffect(() => {
    if (passwordMatchTimerRef.current) {
      clearTimeout(passwordMatchTimerRef.current);
      passwordMatchTimerRef.current = null;
    }

    if (!password && !confirmPassword) {
      setPasswordMatch(null);
      return;
    }

    passwordMatchTimerRef.current = setTimeout(() => {
      if (!confirmPassword) {
        setPasswordMatch(null);
        return;
      }
      setPasswordMatch(password === confirmPassword);
    }, 450);

    return () => {
      if (passwordMatchTimerRef.current) {
        clearTimeout(passwordMatchTimerRef.current);
        passwordMatchTimerRef.current = null;
      }
    };
  }, [password, confirmPassword]);

  const pickAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access photos is required to choose an avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0]?.uri ?? null);
      }
    } catch (e) {
      setError("Could not open photo library. Please try again.");
    }
  };

  const formatDob = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDobChange = (_event: any, selected?: Date) => {
    // Android fires "dismissed" with undefined date
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }

    if (!selected) return;
    setDobDate(selected);
    setDob(formatDob(selected));
    setError(null);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setEmailFieldError(null);

      const trimmedEmail = email.trim().toLowerCase();
      const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
      if (methods.length > 0) {
        setEmailFieldError("This email is already in use.");
        return;
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      // Upload avatar (optional)
      let avatarUrl: string | null = null;
      if (avatarUri) {
        const response = await fetch(avatarUri);
        const blob = await response.blob();
        const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
        await uploadBytes(avatarRef, blob);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      // Update Auth profile
      await updateProfile(user, {
        displayName: fullName.trim(),
        photoURL: avatarUrl ?? undefined,
      });

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName.trim(),
        dob: dob || null,
        avatarUrl,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);
      router.replace("/(auth)/verify-email?from=register");
    } catch (e: any) {
      console.log("Register error", e);
      if (e?.code === "auth/email-already-in-use") {
        setEmailFieldError("This email is already in use.");
      } else {
        setError("Sign up failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoMark,
                {
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.general.black,
                },
              ]}
            >
              <Text style={styles.logoMarkText}>S</Text>
            </View>
            <Text style={[styles.logoText, { color: Colors.primary }]}>
              Spendeka
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                shadowColor:
                  colorScheme === "dark" ? "transparent" : Colors.general.black,
                borderWidth: colorScheme === "dark" ? 1 : 0,
                borderColor:
                  colorScheme === "dark" ? theme.border : "transparent",
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.text }]}>Sign up</Text>
            <Text style={[styles.subtitle, { color: Colors.general.gray600 }]}>
              Create an account to start tracking your spending
            </Text>

            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={pickAvatar}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { borderColor: theme.border, backgroundColor: theme.background },
                ]}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <FontAwesome
                    name="user"
                    size={42}
                    color={Colors.general.gray600}
                  />
                )}
              </View>
              <View style={[styles.avatarCameraBadge, { backgroundColor: Colors.primary }]}>
                <FontAwesome name="camera" size={14} color="#000" />
              </View>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.field}>
              <Text style={styles.label}>
                Full name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <FontAwesome
                  name="id-card-o"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Your name"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  value={fullName}
                  onChangeText={(v) => {
                    setFullName(v);
                    setError(null);
                  }}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowDobPicker(true)}
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    paddingVertical: 10,
                  },
                ]}
              >
                <FontAwesome
                  name="calendar"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.input,
                    { color: dob ? theme.text : Colors[colorScheme].placeholder },
                  ]}
                >
                  {dob || "Select date of birth"}
                </Text>
              </TouchableOpacity>

              {showDobPicker ? (
                <DateTimePicker
                  value={dobDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={handleDobChange}
                />
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Email <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <FontAwesome
                  name="envelope-o"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setEmailFieldError(null);
                    setError(null);
                  }}
                />
              </View>
              {emailFieldError ? (
                <Text style={styles.inlineErrorText}>{emailFieldError}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <FontAwesome
                  name="lock"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={showPassword ? "eye-slash" : "eye"}
                    size={18}
                    color={Colors.general.gray600}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Confirm password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <FontAwesome
                  name="lock"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setError(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={showConfirmPassword ? "eye-slash" : "eye"}
                    size={18}
                    color={Colors.general.gray600}
                  />
                </TouchableOpacity>
              </View>
              {passwordMatch === false ? (
                <Text style={styles.inlineErrorText}>
                  Passwords do not match.
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.buttonDisabled,
                { backgroundColor: Colors.primary },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Creating account..." : "REGISTER"}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account?</Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.bottomLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: Colors.general.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logoMarkText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
  },
  card: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: Colors.general.white,
    shadowColor: Colors.general.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.general.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.general.gray600,
    marginBottom: 20,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    color: Colors.general.gray700,
  },
  requiredStar: {
    color: "#ef4444",
    fontWeight: "800",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.general.white,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  eyeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.general.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 8,
    fontSize: 13,
  },
  inlineErrorText: {
    color: "#ef4444",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  avatarWrap: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 14,
    width: 96,
    height: 96,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 96,
    height: 96,
  },
  avatarCameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    fontSize: 12,
    color: Colors.general.gray600,
  },
  bottomLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
});

