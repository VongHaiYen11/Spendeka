import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

interface HomeToolbarProps {
  iconColor: string;
  onPressHistory: () => void;
  onPressScan: () => void;
  onPressText: () => void;
}

export default function HomeToolbar({
  iconColor,
  onPressHistory,
  onPressScan,
  onPressText,
}: HomeToolbarProps) {
  const cardColor = useThemeColor({}, 'card');

  return (
    <View style={styles.toolbarContainer}>
      <View style={[styles.toolbar, { backgroundColor: cardColor }]}>
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressHistory}>
          <Ionicons name="time-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressScan}>
          <Ionicons name="scan-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Scan bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onPressText}>
          <Ionicons name="text-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="mic-outline" size={28} color={iconColor} />
          <Text style={styles.toolbarLabel}>Voice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 28,
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
    paddingVertical: 6,
  },
  toolbarLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

