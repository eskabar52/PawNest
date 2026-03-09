// app/(auth)/register.tsx — Kayıt Ekranı
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
import { registerUser } from '../../services/firebase/auth';
import { useUserStore } from '../../store/userStore';
import { SPACING } from '../../constants/fonts';

export default function RegisterScreen() {
  const { theme, shared } = useTheme();
  const setUser = useUserStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password, displayName);
      setUser(user);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt yapılamadı.');
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
            <Text style={styles.slogan}>Yeni hesap oluştur</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            <Text
              style={[
                styles.title,
                { color: theme.textPrimary, fontFamily: 'Syne_700Bold' },
              ]}
            >
              Kayıt Ol
            </Text>

            <Input
              label="Ad Soyad"
              placeholder="Ahmet Yılmaz"
              value={displayName}
              onChangeText={setDisplayName}
            />

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
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Zaten hesabın var mı?{' '}
              </Text>
              <Link href="/(auth)/login">
                <Text style={[styles.footerLink, { color: shared.secondary }]}>
                  Giriş Yap
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
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
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
    paddingTop: 24,
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
