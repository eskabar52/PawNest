// app/breeding.tsx — Üreme & Gebelik Takibi Ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { usePetStore } from '../store/petStore';
import { useBreedingStore } from '../store/breedingStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  onPetBreedingCyclesChanged,
  onPetPregnanciesChanged,
  addBreedingCycle,
  deleteBreedingCycle,
  addPregnancy as addPregnancyToDb,
  updatePregnancy as updatePregnancyInDb,
  GESTATION_PERIODS,
  HEAT_CYCLE_INFO,
} from '../services/firebase/breeding';
import { COLORS } from '../constants/colors';
import { SPACING, RADIUS } from '../constants/fonts';

export default function BreedingScreen() {
  const { theme, shared } = useTheme();
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const { cycles, pregnancies, setCycles, addCycle, removeCycle, setPregnancies, addPregnancy, updatePregnancy } = useBreedingStore();

  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showPregnancyModal, setShowPregnancyModal] = useState(false);
  const [cycleNotes, setCycleNotes] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerBreed, setPartnerBreed] = useState('');
  const [loading, setLoading] = useState(false);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  useEffect(() => {
    if (!selectedPet) return;
    const unsub1 = onPetBreedingCyclesChanged(selectedPet.id, setCycles);
    const unsub2 = onPetPregnanciesChanged(selectedPet.id, setPregnancies);
    return () => { unsub1(); unsub2(); };
  }, [selectedPet?.id]);

  const activePregnancy = pregnancies.find((p) => p.status === 'active');
  const gestationDays = selectedPet ? (GESTATION_PERIODS[selectedPet.type] || 60) : 60;
  const heatInfo = selectedPet ? HEAT_CYCLE_INFO[selectedPet.type] : null;

  // Gebelik haftası hesapla
  const getPregnancyWeek = () => {
    if (!activePregnancy) return 0;
    const daysPassed = Math.floor(
      (Date.now() - new Date(activePregnancy.matingDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.ceil(daysPassed / 7);
  };

  const getPregnancyProgress = () => {
    if (!activePregnancy) return 0;
    const daysPassed = Math.floor(
      (Date.now() - new Date(activePregnancy.matingDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(100, Math.round((daysPassed / gestationDays) * 100));
  };

  // Kızgınlık döngüsü ekle
  const handleAddCycle = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const data = {
        petId: selectedPet.id,
        startDate: new Date(),
        symptoms: [],
        notes: cycleNotes.trim() || undefined,
        createdAt: new Date(),
      };
      const id = await addBreedingCycle(data);
      addCycle({ id, ...data });
      setCycleNotes('');
      setShowCycleModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gebelik kaydı ekle
  const handleAddPregnancy = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const matingDate = new Date();
      const expectedDue = new Date(matingDate);
      expectedDue.setDate(expectedDue.getDate() + gestationDays);

      const data = {
        petId: selectedPet.id,
        matingDate,
        partnerName: partnerName.trim() || undefined,
        partnerBreed: partnerBreed.trim() || undefined,
        expectedDueDate: expectedDue,
        status: 'active' as const,
        weeklyNotes: {},
        photos: [],
        createdAt: new Date(),
      };
      const id = await addPregnancyToDb(data);
      addPregnancy({ id, ...data });
      setPartnerName('');
      setPartnerBreed('');
      setShowPregnancyModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gebelik tamamla
  const handleCompletePregnancy = (id: string) => {
    Alert.alert('Gebelik Tamamlandı', 'Doğum gerçekleşti mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet, doğum oldu',
        onPress: async () => {
          await updatePregnancyInDb(id, { status: 'completed', actualDueDate: new Date() });
          updatePregnancy(id, { status: 'completed', actualDueDate: new Date() });
        },
      },
      {
        text: 'Kayıp',
        style: 'destructive',
        onPress: async () => {
          await updatePregnancyInDb(id, { status: 'lost' });
          updatePregnancy(id, { status: 'lost' });
        },
      },
    ]);
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>🍼</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Üreme takibi için önce bir hayvan ekle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backBtn, { color: theme.textMuted }]}>← Geri</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              Üreme Takibi
            </Text>
          </View>

          {/* Aktif Gebelik */}
          {activePregnancy && (
            <Card>
              <View style={styles.pregnancyHeader}>
                <Text style={{ fontSize: 24 }}>🤰</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pregnancyTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                    Aktif Gebelik
                  </Text>
                  <Text style={[styles.pregnancySub, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                    Hafta {getPregnancyWeek()} / {Math.ceil(gestationDays / 7)}
                  </Text>
                </View>
              </View>

              {/* İlerleme */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressFill, { backgroundColor: petColor, width: `${getPregnancyProgress()}%` }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                  %{getPregnancyProgress()} tamamlandı
                </Text>
              </View>

              {/* Bilgiler */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoBox, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={{ fontSize: 14 }}>📅</Text>
                  <Text style={[styles.infoLabel, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>Çiftleşme</Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                    {new Date(activePregnancy.matingDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <View style={[styles.infoBox, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={{ fontSize: 14 }}>🍼</Text>
                  <Text style={[styles.infoLabel, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>Tahmini Doğum</Text>
                  <Text style={[styles.infoValue, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                    {new Date(activePregnancy.expectedDueDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </View>

              {activePregnancy.partnerName && (
                <Text style={[styles.partnerInfo, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Partner: {activePregnancy.partnerName} {activePregnancy.partnerBreed ? `(${activePregnancy.partnerBreed})` : ''}
                </Text>
              )}

              <Button title="Doğum Gerçekleşti" onPress={() => handleCompletePregnancy(activePregnancy.id)} />
            </Card>
          )}

          {/* Kızgınlık Bilgisi */}
          {heatInfo && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                🔴 Kızgınlık Döngüsü Bilgisi
              </Text>
              <View style={styles.heatInfoRow}>
                <View style={[styles.heatInfoBox, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.heatLabel, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>Döngü Aralığı</Text>
                  <Text style={[styles.heatValue, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>{heatInfo.interval}</Text>
                </View>
                <View style={[styles.heatInfoBox, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.heatLabel, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>Süre</Text>
                  <Text style={[styles.heatValue, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>{heatInfo.duration}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Son Döngüler */}
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              📋 Kızgınlık Kayıtları
            </Text>
            {cycles.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                Henüz kayıt yok.
              </Text>
            ) : (
              cycles.slice(0, 5).map((cycle) => (
                <TouchableOpacity
                  key={cycle.id}
                  onLongPress={() => {
                    Alert.alert('Sil', 'Bu kayıt silinsin mi?', [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Sil', style: 'destructive', onPress: () => { deleteBreedingCycle(cycle.id); removeCycle(cycle.id); } },
                    ]);
                  }}
                >
                  <View style={[styles.cycleRow, { borderBottomColor: theme.border }]}>
                    <Text style={{ fontSize: 14 }}>🔴</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cycleDate, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                        {new Date(cycle.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                      {cycle.notes && (
                        <Text style={[styles.cycleNotes, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                          {cycle.notes}
                        </Text>
                      )}
                    </View>
                    {cycle.endDate && (
                      <Text style={[styles.cycleDuration, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                        {Math.ceil((new Date(cycle.endDate).getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24))} gün
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Card>

          {/* Gebelik Geçmişi */}
          {pregnancies.filter((p) => p.status !== 'active').length > 0 && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                🍼 Gebelik Geçmişi
              </Text>
              {pregnancies
                .filter((p) => p.status !== 'active')
                .map((p) => (
                  <View key={p.id} style={[styles.cycleRow, { borderBottomColor: theme.border }]}>
                    <Text style={{ fontSize: 14 }}>{p.status === 'completed' ? '✅' : '❌'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cycleDate, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                        {new Date(p.matingDate).toLocaleDateString('tr-TR')}
                        {p.actualDueDate && ` → ${new Date(p.actualDueDate).toLocaleDateString('tr-TR')}`}
                      </Text>
                      {p.partnerName && (
                        <Text style={[styles.cycleNotes, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                          Partner: {p.partnerName}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
            </Card>
          )}

          {/* Eylem Butonları */}
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Button title="🔴 Kızgınlık Kaydet" onPress={() => setShowCycleModal(true)} variant="secondary" />
            </View>
            {!activePregnancy && (
              <View style={{ flex: 1 }}>
                <Button title="🤰 Gebelik Başlat" onPress={() => setShowPregnancyModal(true)} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Kızgınlık Modalı */}
      <Modal visible={showCycleModal} onClose={() => setShowCycleModal(false)} title="Kızgınlık Döngüsü Kaydet">
        <Input label="Notlar" placeholder="Belirtiler, davranış değişiklikleri..." value={cycleNotes} onChangeText={setCycleNotes} multiline />
        <Button title="Kaydet" onPress={handleAddCycle} loading={loading} />
      </Modal>

      {/* Gebelik Modalı */}
      <Modal visible={showPregnancyModal} onClose={() => setShowPregnancyModal(false)} title="Gebelik Kaydı Başlat">
        <Text style={[styles.gestationInfo, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
          Tahmini gebelik süresi: ~{gestationDays} gün
        </Text>
        <Input label="Partner Adı" placeholder="Erkek hayvanın adı" value={partnerName} onChangeText={setPartnerName} />
        <Input label="Partner Irkı" placeholder="Irkı" value={partnerBreed} onChangeText={setPartnerBreed} />
        <Button title="Gebelik Başlat" onPress={handleAddPregnancy} loading={loading} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  backBtn: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  title: { fontSize: 22 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg, padding: SPACING.xl },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  pregnancyHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  pregnancyTitle: { fontSize: 18 },
  pregnancySub: { fontSize: 12 },
  progressContainer: { gap: 6, marginBottom: SPACING.md },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 11 },
  infoGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  infoBox: { flex: 1, alignItems: 'center', gap: 2, padding: SPACING.sm, borderRadius: RADIUS.sm },
  infoLabel: { fontSize: 10 },
  infoValue: { fontSize: 12 },
  partnerInfo: { fontSize: 12, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, marginBottom: SPACING.md },
  heatInfoRow: { flexDirection: 'row', gap: SPACING.sm },
  heatInfoBox: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.sm, alignItems: 'center', gap: 4 },
  heatLabel: { fontSize: 11 },
  heatValue: { fontSize: 13 },
  cycleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  cycleDate: { fontSize: 13 },
  cycleNotes: { fontSize: 11, marginTop: 2 },
  cycleDuration: { fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  gestationInfo: { fontSize: 13, textAlign: 'center', marginBottom: SPACING.md },
});
