// app/_layout.tsx — Root Layout (ThemeProvider, fontlar, auth yönlendirme)
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Syne_700Bold } from '@expo-google-fonts/syne';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { onAuthChanged, getUserProfile } from '../services/firebase/auth';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { mode, theme } = useTheme();
  const { isAuthenticated, isLoading, setUser } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  // Auth durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch {
          // Profil yoksa temel bilgilerle oluştur
          setUser({
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Kullanıcı',
            email: firebaseUser.email || '',
            plan: 'free',
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Auth durumuna göre yönlendirme
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    SpaceMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
