import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter, useLocalSearchParams } from "expo-router";
import { sendEmailVerification, signOut } from "firebase/auth";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/config/firebaseConfig";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const isFromRegister = from === "register";

  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    router.replace("/(auth)/login");
    return null;
  }

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      setResendSuccess(false);
      await sendEmailVerification(auth.currentUser!);
      setResendSuccess(true);
    } catch (e) {
      console.log("Resend verification error", e);
      setError("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    try {
      setCheckLoading(true);
      setError(null);
      await user.reload();
      if (user.emailVerified) {
        if (isFromRegister) {
          await signOut(auth);
          router.replace("/(auth)/login");
        } else {
          router.replace("/");
        }
      } else {
        setError("Email not verified yet. Please click the link in your email.");
      }
    } catch (e) {
      console.log("Reload user error", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <FontAwesome
            name="envelope-o"
            size={48}
            color={Colors.primary}
          />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          Verify your email
        </Text>
        <Text
          style={[styles.subtitle, { color: Colors.general.gray600 }]}
        >
          We sent a verification link to{" "}
          <Text style={styles.email}>{user.email}</Text>. Please click the
          link in that email to verify your account.
          {isFromRegister
            ? " After verifying, tap the button below to go to the login screen."
            : ""}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {resendSuccess && (
          <Text style={styles.successText}>
            Verification email sent. Check your inbox.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: Colors.primary },
            (resendLoading || checkLoading) && styles.buttonDisabled,
          ]}
          onPress={handleCheckVerified}
          disabled={resendLoading || checkLoading}
        >
          {checkLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isFromRegister ? "I've verified – go to login" : "I've verified"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
            },
          ]}
          onPress={handleResend}
          disabled={resendLoading || checkLoading}
        >
          {resendLoading ? (
            <ActivityIndicator color={theme.text} size="small" />
          ) : (
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Resend verification email
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  email: {
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 12,
    fontSize: 13,
    textAlign: "center",
  },
  successText: {
    color: "#10b981",
    marginBottom: 12,
    fontSize: 13,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
