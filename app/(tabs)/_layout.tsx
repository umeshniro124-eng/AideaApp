import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

export default function TabLayout() {
  useEffect(() => {
  // Navigation bar එක සැඟවීමට
  NavigationBar.setVisibilityAsync("hidden");

  // අවශ්‍ය නම් නැවත පෙන්වීමට (උදා: Screen එකෙන් ඉවත් වන විට)
  return () => {
    NavigationBar.setVisibilityAsync("visible");
  };
}, []);

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#2f5d98', // Active වෙනකොට තද නිල් පාට
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false, // උඩින් වැටෙන default header එක අයින් කරන්න
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 65,
          paddingBottom: 10,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}