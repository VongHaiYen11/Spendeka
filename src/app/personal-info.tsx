import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { usePrimaryColor, useTheme } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { db } from "@/config/firebaseConfig";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { uploadAvatarImageToCloudinary } from "@/services/ImageService";

type UserProfileDoc = {
  fullName?: string;
  dob?: string | null;
  avatarUrl?: string | null;
};

function formatDob(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDob(dob: string): Date | null {
  // expects YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const primaryColor = usePrimaryColor();
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<string>(""); // YYYY-MM-DD or ""
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // For avatar: we keep both the original remote URL and current selection (remote or local).
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const initialRef = useRef<{ fullName: string; dob: string; avatar: string | null } | null>(
    null
  );

  const isDirty = useMemo(() => {
    const init = initialRef.current;
    if (!init) return false;
    return (
      init.fullName !== fullName.trim() ||
      init.dob !== dob ||
      init.avatar !== (avatarUri ?? null)
    );
  }, [fullName, dob, avatarUri]);

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? (snap.data() as UserProfileDoc) : {};

      const name = (data.fullName?.trim() || user.displayName?.trim() || "User") as string;
      const dobValue = (data.dob ?? "") as string;
      const avatar = (data.avatarUrl ?? user.photoURL ?? null) as string | null;

      setFullName(name);
      setDob(dobValue || "");
      setDobDate(dobValue ? parseDob(dobValue) : null);
      setOriginalAvatarUrl(avatar);
      setAvatarUri(avatar);

      initialRef.current = {
        fullName: name.trim(),
        dob: dobValue || "",
        avatar: avatar,
      };
    } catch (e) {
      setFullName(user.displayName?.trim() || "User");
      setDob("");
      setDobDate(null);
      setOriginalAvatarUrl(user.photoURL ?? null);
      setAvatarUri(user.photoURL ?? null);
      initialRef.current = {
        fullName: (user.displayName?.trim() || "User").trim(),
        dob: "",
        avatar: user.photoURL ?? null,
      };
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.displayName, user?.photoURL]);

  useEffect(() => {
    if (!user?.uid) {
      router.replace("/(auth)/login");
      return;
    }
    loadProfile();
  }, [user?.uid, loadProfile]);

  // Unsaved-changes guard
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e: any) => {
      if (!isDirty || saving) return;
      e.preventDefault();
      Alert.alert("Unsaved changes", "You have unsaved changes. Save before leaving?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Don't Save",
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
        {
          text: "Save",
          onPress: async () => {
            const ok = await handleSave(true);
            if (ok) {
              navigation.dispatch(e.data.action);
            }
          },
        },
      ]);
    });
    return unsub;
  }, [navigation, isDirty, saving]);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow photo access to choose an avatar.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled) {
        setAvatarUri(result.assets[0]?.uri ?? null);
      }
    } catch {
      Alert.alert("Error", "Could not open photo library. Please try again.");
    }
  };

  const handleDobChange = (_event: any, selected?: Date) => {
    if (Platform.OS === "android") setShowDobPicker(false);
    if (!selected) return;
    setDobDate(selected);
    setDob(formatDob(selected));
  };

  const handleSave = async (silent?: boolean): Promise<boolean> => {
    if (!user?.uid) return false;
    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      if (!silent) Alert.alert("Missing info", "Please enter your name.");
      return false;
    }

    setSaving(true);
    try {
      let finalAvatarUrl: string | null = originalAvatarUrl ?? null;

      // If user picked a local image, upload it
      const isLocal = avatarUri && !avatarUri.startsWith("http");
      if (isLocal && avatarUri) {
        finalAvatarUrl = await uploadAvatarImageToCloudinary(avatarUri);
      } else {
        finalAvatarUrl = avatarUri ?? null;
      }

      // Update Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: nameTrimmed,
          photoURL: finalAvatarUrl ?? undefined,
        });
      }

      // Update Firestore (merge)
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          fullName: nameTrimmed,
          dob: dob || null,
          avatarUrl: finalAvatarUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setOriginalAvatarUrl(finalAvatarUrl);
      setAvatarUri(finalAvatarUrl);
      initialRef.current = { fullName: nameTrimmed, dob: dob || "", avatar: finalAvatarUrl };

      if (!silent) Alert.alert("Saved", "Your profile has been updated.");
      return true;
    } catch {
      if (!silent) Alert.alert("Error", "Could not save changes. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Personal Info",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => handleSave()}
              disabled={!isDirty || saving}
              activeOpacity={0.8}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: primaryColor,
                  opacity: !isDirty || saving ? 0.5 : 1,
                },
              ]}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.85}>
          <View style={[styles.avatarCircle, { borderColor: theme.border, backgroundColor: theme.card }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <FontAwesome name="user" size={48} color={Colors.general.gray600} />
            )}
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: primaryColor }]}>
            <FontAwesome name="camera" size={14} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.general.gray700 }]}>Name</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <FontAwesome name="id-card-o" size={18} color={Colors.general.gray600} style={styles.inputIcon} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={Colors[scheme].placeholder}
              style={[styles.input, { color: theme.text }]}
              editable={!loading && !saving}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.general.gray700 }]}>Date of birth</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowDobPicker(true)}
            disabled={loading || saving}
            style={[
              styles.inputWrapper,
              { borderColor: theme.border, backgroundColor: theme.background, paddingVertical: 10 },
            ]}
          >
            <FontAwesome name="calendar" size={18} color={Colors.general.gray600} style={styles.inputIcon} />
            <Text style={[styles.input, { color: dob ? theme.text : Colors[scheme].placeholder }]}>
              {dob || "Select date of birth (optional)"}
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

        {loading ? (
          <Text style={[styles.helper, { color: Colors.general.gray600 }]}>Loading…</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 18 },
  avatarWrap: {
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 20,
    width: 112,
    height: 112,
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 112, height: 112 },
  avatarBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14 },
  helper: { marginTop: 8, textAlign: "center", fontSize: 13 },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  saveBtnText: { color: "#000", fontWeight: "800" },
});

