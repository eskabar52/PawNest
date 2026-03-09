// app/(tabs)/_layout.tsx — Tab Navigator Layout
import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme, shared } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: shared.secondary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.navBackground,
          borderTopColor: theme.navBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_700Bold',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: 'Bakım',
          tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Sağlık',
          tabBarIcon: ({ color }) => <TabIcon emoji="💊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Anılar',
          tabBarIcon: ({ color }) => <TabIcon emoji="📸" color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Asistan',
          tabBarIcon: ({ color }) => <TabIcon emoji="🤖" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}
