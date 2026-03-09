// app/(tabs)/health.tsx — Sağlık Ekranı (Placeholder)
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { SPACING } from '../../constants/fonts';

export default function HealthScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
          Sağlık Takibi
        </Text>
        <Card>
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>💊</Text>
          <Text style={[styles.placeholder, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Veteriner kayıtları, aşı takvimi, ilaç takibi ve sağlık skoru burada yer alacak.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 24 },
  placeholder: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
