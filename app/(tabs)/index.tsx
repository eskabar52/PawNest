// app/(tabs)/index.tsx — Dashboard (Ana Sayfa)
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';
import { Card } from '../../components/ui/Card';
import { PetSelector } from '../../components/pet/PetSelector';
import { onUserPetsChanged } from '../../services/firebase/pets';
import { PET_TYPE_ICONS, PET_TYPE_LABELS } from '../../constants/config';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/fonts';

export default function DashboardScreen() {
  const { theme, shared } = useTheme();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { pets, selectedPetId, setPets } = usePetStore();
  const selectedPet = usePetStore((s) => s.selectedPet)();

  // Hayvanları gerçek zamanlı dinle
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onUserPetsChanged(user.id, (fetchedPets) => {
      setPets(fetchedPets);
    });
    return unsubscribe;
  }, [user?.id]);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

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

          {/* Hayvan Seçici */}
          <View style={styles.petSelectorWrapper}>
            <PetSelector />
          </View>
        </LinearGradient>

        {/* İçerik */}
        <View style={styles.content}>
          {/* Seçili hayvan yoksa hoş geldin kartı */}
          {!selectedPet ? (
            <Card>
              <Text style={styles.cardEmoji}>🐾</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                Hoş Geldin!
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                İlk hayvanını ekleyerek başla. Yukarıdaki "+" butonuna dokun.
              </Text>
            </Card>
          ) : (
            <>
              {/* Seçili Hayvan Özet Kartı */}
              <TouchableOpacity onPress={() => router.push(`/pet/${selectedPet.id}`)}>
                <Card>
                  <View style={styles.petSummary}>
                    <View style={[styles.petIcon, { backgroundColor: `${petColor}15` }]}>
                      <Text style={{ fontSize: 32 }}>{PET_TYPE_ICONS[selectedPet.type]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.petName, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                        {selectedPet.name}
                      </Text>
                      <Text style={[styles.petBreed, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                        {selectedPet.breed || PET_TYPE_LABELS[selectedPet.type]}
                        {selectedPet.weight ? ` • ${selectedPet.weight} kg` : ''}
                      </Text>
                    </View>
                    <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </>
          )}

          {/* Hızlı İstatistikler */}
          <View style={styles.statsRow}>
            {[
              { emoji: '🔥', label: 'Seri', value: '0 gün' },
              { emoji: '🏥', label: 'Vet', value: '0' },
              { emoji: '📸', label: 'Fotoğraf', value: '0' },
              { emoji: '👥', label: 'Aile', value: '1' },
            ].map((stat) => (
              <Card key={stat.label} style={styles.statCard}>
                <Text style={{ fontSize: 20 }}>{stat.emoji}</Text>
                <Text style={[styles.statValue, { color: shared.secondary, fontFamily: 'Nunito_800ExtraBold' }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                  {stat.label}
                </Text>
              </Card>
            ))}
          </View>

          {/* Hızlı Erişim */}
          {selectedPet && (
            <View style={styles.quickAccessRow}>
              <TouchableOpacity
                style={[styles.quickAccessBtn, { backgroundColor: `${petColor}10`, borderColor: petColor }]}
                onPress={() => router.push('/breeding')}
              >
                <Text style={{ fontSize: 20 }}>🍼</Text>
                <Text style={[styles.quickAccessText, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                  Üreme Takibi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAccessBtn, { backgroundColor: `${shared.secondary}10`, borderColor: shared.secondary }]}
                onPress={() => router.push('/family')}
              >
                <Text style={{ fontSize: 20 }}>👨‍👩‍👧‍👦</Text>
                <Text style={[styles.quickAccessText, { color: shared.secondary, fontFamily: 'Nunito_700Bold' }]}>
                  Aile
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
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
  petSelectorWrapper: {
    marginTop: SPACING.lg,
    marginHorizontal: -SPACING.xl,
  },
  content: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 20, marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 22 },
  petSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  petIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: { fontSize: 18 },
  petBreed: { fontSize: 13, marginTop: 2 },
  arrow: { fontSize: 20 },
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
  statValue: { fontSize: 14, marginTop: 4 },
  statLabel: { fontSize: 10, marginTop: 2 },
  infoText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  quickAccessRow: { flexDirection: 'row', gap: SPACING.sm },
  quickAccessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickAccessText: { fontSize: 13 },
});
