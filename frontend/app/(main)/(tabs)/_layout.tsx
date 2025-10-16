import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../../../components/common/haptic-tab';
import { IconSymbol } from '../../../components/ui/icon-symbol';
import TabBarBackground from '../../../components/browse/tab-bar-background';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.netflix.red,
        tabBarInactiveTintColor: Colors.netflix.lightGray,
        tabBarStyle: {
          backgroundColor: Colors.netflix.black,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'house.fill' : 'house'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon"
        options={{
          title: 'Próximamente',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'play.rectangle.fill' : 'play.rectangle'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Descargas',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'arrow.down.circle.fill' : 'arrow.down.circle'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-netflix"
        options={{
          title: 'Mi Netflix',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}