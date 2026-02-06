import React, { useState } from "react";
import {
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
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth } from "@/config/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
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
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await sendEmailVerification(user);
      router.replace("/(auth)/verify-email?from=register");
    } catch (e: any) {
      console.log("Register error", e);
      setError("Sign up failed. Please try again later.");
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

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
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
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
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

            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
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
                  onChangeText={setConfirmPassword}
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

