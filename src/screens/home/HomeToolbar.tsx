import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

interface HomeToolbarProps {
  iconColor: string;
  onPressHistory: () => void;
  onPressText: () => void;
  onPressVoice: () => void;
}

export default function HomeToolbar({
  iconColor,
  onPressHistory,
  onPressText,
  onPressVoice,
}: HomeToolbarProps) {
  return (
    <View style={styles.toolbarContainer}>
      <View
        style={styles.toolbar}
        lightColor="#ffffff"
        darkColor="rgba(255,255,255,0.1)"
      >
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressHistory}>
          <Ionicons name="time-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="scan-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Scan bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressText}>
          <Ionicons name="text-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressVoice}>
          <Ionicons name="mic-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Voice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  toolbarLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});

