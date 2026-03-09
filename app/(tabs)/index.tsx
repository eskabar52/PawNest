// app/(tabs)/index.tsx — Dashboard (Ana Sayfa)
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../components/ui/Card';
import { SPACING } from '../../constants/fonts';

export default function DashboardScreen() {
  const { theme, shared } = useTheme();
  const user = useUserStore((s) => s.user);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.greeting}>
            Merhaba, {user?.displayName || 'Kullanıcı'} 👋
          </Text>
          <Text style={styles.appTitle}>PawNest</Text>
          <Text style={styles.subtitle}>
            Hayvanını ekleyerek başla!
          </Text>
        </LinearGradient>

        {/* İçerik */}
        <View style={styles.content}>
          <Card>
            <Text style={[styles.cardEmoji]}>🐾</Text>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.textPrimary, fontFamily: 'Syne_700Bold' },
              ]}
            >
              Hoş Geldin!
            </Text>
            <Text
              style={[
                styles.cardDesc,
                { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' },
              ]}
            >
              Hayvanını ekle ve bakım rutinlerini takip etmeye başla.
              Dashboard bu alanda daha fazla widget ile dolacak.
            </Text>
          </Card>

          {/* Hızlı İstatistikler Placeholder */}
          <View style={styles.statsRow}>
            {[
              { emoji: '🔥', label: 'Seri', value: '0 gün' },
              { emoji: '🏥', label: 'Vet', value: '0' },
              { emoji: '📸', label: 'Fotoğraf', value: '0' },
              { emoji: '👥', label: 'Aile', value: '1' },
            ].map((stat) => (
              <Card key={stat.label} style={styles.statCard}>
                <Text style={{ fontSize: 20 }}>{stat.emoji}</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: shared.secondary, fontFamily: 'Nunito_800ExtraBold' },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.textMuted, fontFamily: 'Nunito_700Bold' },
                  ]}
                >
                  {stat.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Syne_700Bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  content: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: 14,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
