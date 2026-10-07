import React from 'react';
import { StyleSheet, View, ViewStyle, SafeAreaView, StatusBar, Platform } from 'react-native';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SafeScreen: React.FC<SafeScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar barStyle="light-content" backgroundColor="#070a12" translucent={false} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a12',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 34) + 10 : 0,
  },
  content: {
    flex: 1,
  },
});

