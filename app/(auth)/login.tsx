// app/(auth)/login.tsx — Giriş Ekranı
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { loginUser } from '../../services/firebase/auth';
import { useUserStore } from '../../store/userStore';
import { SPACING } from '../../constants/fonts';

export default function LoginScreen() {
  const { theme, shared } = useTheme();
  const setUser = useUserStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre gerekli.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setUser(user);
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.header}
          >
            <Text style={styles.logo}>🐾</Text>
            <Text style={styles.appName}>PawNest</Text>
            <Text style={styles.slogan}>Her hayvanın bir yuvası olsun.</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            <Text
              style={[
                styles.title,
                { color: theme.textPrimary, fontFamily: 'Syne_700Bold' },
              ]}
            >
              Giriş Yap
            </Text>

            <Input
              label="Email"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Giriş Yap"
              onPress={handleLogin}
              loading={loading}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Hesabın yok mu?{' '}
              </Text>
              <Link href="/(auth)/register">
                <Text style={[styles.footerLink, { color: shared.secondary }]}>
                  Kayıt Ol
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Syne_700Bold',
    color: '#FFFFFF',
  },
  slogan: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  form: {
    flex: 1,
    padding: SPACING.xl,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
});
