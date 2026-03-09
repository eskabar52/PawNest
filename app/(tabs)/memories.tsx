// app/(tabs)/memories.tsx — Anılar Ekranı (Placeholder)
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { SPACING } from '../../constants/fonts';

export default function MemoriesScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
          Anılar
        </Text>
        <Card>
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>📸</Text>
          <Text style={[styles.placeholder, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Fotoğraf albümü ve kilometre taşları burada görünecek. Hayvanınla birlikte anılarınızı ölümsüzleştir!
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
