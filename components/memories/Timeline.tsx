// components/memories/Timeline.tsx — Kilometre Taşları Zaman Tüneli
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';
import { Milestone } from '../../types';
import { MILESTONE_TEMPLATES } from '../../services/firebase/photos';

interface Props {
  milestones: Milestone[];
  petColor: string;
  onLongPress?: (milestone: Milestone) => void;
}

export function Timeline({ milestones, petColor, onLongPress }: Props) {
  const { theme } = useTheme();

  if (milestones.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40 }}>🏆</Text>
        <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
          Henüz kilometre taşı yok
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {milestones.map((ms, index) => {
        const template = MILESTONE_TEMPLATES.find((t) => t.type === ms.type);
        return (
          <TouchableOpacity
            key={ms.id}
            activeOpacity={0.7}
            onLongPress={() => onLongPress?.(ms)}
          >
            <View style={styles.row}>
              {/* Sol çizgi */}
              <View style={styles.lineContainer}>
                <View style={[styles.dot, { backgroundColor: petColor }]}>
                  <Text style={{ fontSize: 12 }}>{template?.icon || '⭐'}</Text>
                </View>
                {index < milestones.length - 1 && (
                  <View style={[styles.line, { backgroundColor: theme.border }]} />
                )}
              </View>

              {/* Kart */}
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.date, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                  {new Date(ms.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                  {ms.title}
                </Text>
                {ms.description && (
                  <Text style={[styles.desc, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                    {ms.description}
                  </Text>
                )}
                {ms.photoUrl && (
                  <Image source={{ uri: ms.photoUrl }} style={styles.cardPhoto} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  row: { flexDirection: 'row', gap: SPACING.md },
  lineContainer: { alignItems: 'center', width: 32 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, marginVertical: 4 },
  card: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 4,
  },
  date: { fontSize: 11 },
  title: { fontSize: 15 },
  desc: { fontSize: 12, lineHeight: 18 },
  cardPhoto: { width: '100%', height: 120, borderRadius: RADIUS.sm, marginTop: 6 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: SPACING.sm },
  emptyText: { fontSize: 14 },
});
