// components/care/StreakBadge.tsx — Streak Rozeti
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';

interface StreakBadgeProps {
  streak: number;
  completionRate: number;
}

export function StreakBadge({ streak, completionRate }: StreakBadgeProps) {
  const { theme, shared } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Streak */}
      <View style={styles.section}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.value, { color: shared.secondary, fontFamily: 'Nunito_800ExtraBold' }]}>
          {streak}
        </Text>
        <Text style={[styles.label, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
          gün seri
        </Text>
      </View>

      {/* Ayırıcı */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Tamamlanma */}
      <View style={styles.section}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={[styles.value, { color: shared.secondary, fontFamily: 'Nunito_800ExtraBold' }]}>
          %{completionRate}
        </Text>
        <Text style={[styles.label, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
          tamamlandı
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  section: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  emoji: { fontSize: 20 },
  value: { fontSize: 18 },
  label: { fontSize: 10 },
  divider: {
    width: 1,
    marginVertical: 4,
  },
});
