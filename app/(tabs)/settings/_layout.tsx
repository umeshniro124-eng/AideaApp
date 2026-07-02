import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

// Settings තුළ tabs පහසුකම ක්‍රියාත්මක කිරීම
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function SettingsLayout() {
  return (
    <MaterialTopTabs>
      <MaterialTopTabs.Screen name="index" options={{ title: 'Profile' }} />
      <MaterialTopTabs.Screen name="bank" options={{ title: 'Bank Details' }} />
    </MaterialTopTabs>
  );
}