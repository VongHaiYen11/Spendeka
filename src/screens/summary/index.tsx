import { StyleSheet } from 'react-native';
import { Text, View, SafeView } from '@/components/Themed';
import { Text as RNText } from 'react-native';

export default function Summary() { 
  return (
    <SafeView>
      <Text>
        Welcome to Nativewind!
      </Text>
      <RNText className="text-red-500 text-lg">
        This is a normal React Native Text
      </RNText>
    </SafeView>
  );
}
