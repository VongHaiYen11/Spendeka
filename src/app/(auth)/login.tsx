import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth } from "@/config/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const { message } = useLocalSearchParams<{ message?: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (message === "verify_email") {
      setInfo(
        "Please check your email and click the verification link. Then log in."
      );
    }
  }, [message]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      console.log("Email login error", e);
      let message = "Sign-in failed. Please try again.";

      if (e?.code === "auth/invalid-credential") {
        message = "Email or password is incorrect.";
      } else if (e?.code === "auth/user-not-found") {
        message = "Account not found.";
      } else if (e?.code === "auth/too-many-requests") {
        message =
          "Too many attempts. Please wait a few minutes and try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first to reset your password.");
      return;
    }

    try {
      setError(null);
      setInfo(null);
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset email sent. Please check your inbox.");
    } catch (e) {
      console.log("Forgot password error", e);
      setError("Unable to send password reset email. Please try again.");
    }
  };

  const goToRegister = () => {
    router.push("/(auth)/register");
  };

  const isDark = colorScheme === "dark";

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
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
            {/* Logo mark cách điệu đơn giản cho Spendeka */}
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
            <Text
              style={[
                styles.logoText,
                { color: Colors.primary },
              ]}
            >
              Spendeka
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                shadowColor: isDark ? "transparent" : Colors.general.black,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? theme.border : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Login
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: Colors.general.gray600 },
              ]}
            >
              Sign in to continue tracking your spending
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
            {info && <Text style={styles.infoText}>{info}</Text>}

            {/* Email */}
            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: Colors.general.gray700 },
                ]}
              >
                Email
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
                  name="user-o"
                  size={18}
                  color={Colors.general.gray600}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text },
                  ]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text
                style={[
                  styles.label,
                  { color: Colors.general.gray700 },
                ]}
              >
                Password
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
                  style={[
                    styles.input,
                    { color: theme.text },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme].placeholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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

            {/* Forgot password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>FORGOT PASSWORD</Text>
            </TouchableOpacity>

            {/* Primary Login button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: Colors.primary,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* Bottom register link */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={goToRegister}>
                <Text style={styles.bottomLink}> Register here</Text>
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
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 12,
    letterSpacing: 0.6,
    color: Colors.general.gray600,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
  errorText: {
    color: "#ef4444",
    marginBottom: 8,
    fontSize: 13,
  },
  infoText: {
    color: "#10b981",
    marginBottom: 8,
    fontSize: 13,
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

