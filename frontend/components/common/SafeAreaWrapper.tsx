import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor = '#000',
  statusBarStyle = 'light-content',
  statusBarBackgroundColor = 'transparent',
  edges = ['top', 'bottom'],
}) => {
  const insets = useSafeAreaInsets();

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor,
      paddingTop: edges.includes('top') ? insets.top : 0,
      paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: edges.includes('left') ? insets.left : 0,
      paddingRight: edges.includes('right') ? insets.right : 0,
    },
  };

  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={Platform.OS === 'android' ? backgroundColor : statusBarBackgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <View style={dynamicStyles.container}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

export default SafeAreaWrapper;