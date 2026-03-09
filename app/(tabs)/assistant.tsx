// app/(tabs)/assistant.tsx — AI Asistan Ekranı (Placeholder)
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { SPACING } from '../../constants/fonts';

export default function AssistantScreen() {
  const { theme, shared } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
          AI Asistan
        </Text>
        <Card>
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🤖</Text>
          <Text style={[styles.placeholder, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Paw, senin evcil hayvan asistanın! Hayvanınla ilgili her soruyu sorabilirsin. Claude API ile çalışır.
          </Text>
        </Card>

        {/* Hızlı soru önerileri */}
        <View style={styles.suggestions}>
          {[
            'Ne kadar mama yemeli?',
            'Tüyleri neden dökülüyor?',
            'Aşı takvimi nasıl olmalı?',
          ].map((q) => (
            <View
              key={q}
              style={[
                styles.suggestionChip,
                { backgroundColor: `${shared.secondary}15`, borderColor: shared.secondary },
              ]}
            >
              <Text style={[styles.suggestionText, { color: shared.secondary, fontFamily: 'Nunito_700Bold' }]}>
                {q}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 24 },
  placeholder: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  suggestions: { gap: SPACING.sm },
  suggestionChip: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 13 },
});
