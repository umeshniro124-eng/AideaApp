import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* index.tsx සඳහා */}
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} /> }} />
      
      {/* calendar.tsx සඳහා */}
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color }) => <Ionicons name="calendar" color={color} size={24} /> }} />
      
      {/* history.tsx සඳහා */}
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <Ionicons name="list" color={color} size={24} /> }} />
      
      {/* settings ෆෝල්ඩරය සඳහා (මෙය ස්වයංක්‍රීයව settings/_layout.tsx අරගනී) */}
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} size={24} /> }} />
    </Tabs>
  );
}