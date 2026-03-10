// app/pet/_layout.tsx — Pet Stack Layout
import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function PetLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
