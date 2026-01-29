import { StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, View, SafeView } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const [userName] = useState('User'); // TODO: Get from user profile/authentication
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;

  return (
    <SafeView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Toolbar */}
      <View style={styles.toolbarContainer}>
        <View 
          style={styles.toolbar}
          lightColor="#ffffff"
          darkColor="rgba(255,255,255,0.1)"
        >
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="time-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="scan-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Scan bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="text-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="mic-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Voice</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
