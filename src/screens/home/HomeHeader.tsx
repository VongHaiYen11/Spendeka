import { Text, View } from "@/components/Themed";
import { useI18n } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

interface HomeHeaderProps {
  userName: string;
  avatarUrl?: string | null;
  iconColor: string;
  onPressProfile: () => void;
}

export default function HomeHeader({
  userName,
  avatarUrl,
  iconColor,
  onPressProfile,
}: HomeHeaderProps) {
  const { t } = useI18n();
  return (
    <View style={styles.header}>
      <Text style={styles.welcomeText}>
        {t("home.welcome", { name: userName })}
      </Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onPressProfile}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={iconColor}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
});
