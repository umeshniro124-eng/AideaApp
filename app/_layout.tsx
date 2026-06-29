import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* (tabs) ෆෝල්ඩර් එක ඇතුළේ තියෙන ඒවා */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* අලුතින් හදපු add-transaction පිටුව */}
      <Stack.Screen name="add-transaction" options={{ headerShown: false }} />
    </Stack>
  );
}