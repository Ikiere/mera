/**
 * MERA Main Tab Navigation
 * 4 Bottom tabs matching official design reference (Screen 5, Screen 6, Screen 15):
 * 1. Home
 * 2. Scripts
 * 3. Recordings
 * 4. Settings
 * Full-screen studio route with zero tab-bar obstruction during video recording.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : Platform.OS === 'android' ? 12 : 8;
  const barHeight = 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: barHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarActiveTintColor: THEME.colors.accentPrimary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Scripts */}
      <Tabs.Screen
        name="scripts"
        options={{
          title: 'Scripts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Recordings (Gallery) */}
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Recordings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'videocam' : 'videocam-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Studio: Immersive Fullscreen Mode (hidden from tab bar) */}
      <Tabs.Screen
        name="studio"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.colors.background,
    borderTopColor: 'rgba(51, 43, 64, 0.65)',
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.medium,
    fontFamily: THEME.typography.fontFamilies.sans,
    marginTop: 2,
  },
});
