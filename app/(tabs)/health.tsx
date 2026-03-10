// app/(tabs)/health.tsx — Sağlık Takibi Ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePetStore } from '../../store/petStore';
import { useHealthStore } from '../../store/healthStore';
import { useCareStore } from '../../store/careStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { HealthScoreRing } from '../../components/health/HealthScoreRing';
import {
  onPetHealthRecordsChanged,
  onPetSymptomsChanged,
  onPetMedicationsChanged,
  addHealthRecord,
  addSymptom as addSymptomToDb,
  deleteHealthRecord,
  SYMPTOM_OPTIONS,
} from '../../services/firebase/health';
import { calculateHealthScore } from '../../utils/healthScore';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/fonts';
import { HealthRecordType } from '../../types';

const RECORD_TYPES: { key: HealthRecordType; label: string; icon: string }[] = [
  { key: 'checkup', label: 'Kontrol', icon: '🏥' },
  { key: 'vaccine', label: 'Aşı', icon: '💉' },
  { key: 'medication', label: 'İlaç', icon: '💊' },
  { key: 'surgery', label: 'Ameliyat', icon: '🔬' },
  { key: 'other', label: 'Diğer', icon: '📋' },
];

export default function HealthScreen() {
  const { theme, shared } = useTheme();
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const careTasks = useCareStore((s) => s.tasks);
  const { records, symptoms, medications, setRecords, setSymptoms, setMedications, addRecord, addSymptom, removeRecord } = useHealthStore();

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [recordType, setRecordType] = useState<HealthRecordType>('checkup');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordVet, setRecordVet] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomNotes, setSymptomNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  // Verileri dinle
  useEffect(() => {
    if (!selectedPet) return;
    const unsub1 = onPetHealthRecordsChanged(selectedPet.id, setRecords);
    const unsub2 = onPetSymptomsChanged(selectedPet.id, setSymptoms);
    const unsub3 = onPetMedicationsChanged(selectedPet.id, setMedications);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [selectedPet?.id]);

  // Sağlık skoru hesapla
  const healthScore = selectedPet
    ? calculateHealthScore({
        records,
        symptoms,
        medications,
        careTasks,
        petWeight: selectedPet.weight,
        isNeutered: selectedPet.isNeutered,
      })
    : { score: 50, categories: [] };

  // Veteriner kaydı ekle
  const handleAddRecord = async () => {
    if (!selectedPet || !recordTitle.trim()) return;
    setLoading(true);
    try {
      const data = {
        petId: selectedPet.id,
        type: recordType,
        title: recordTitle.trim(),
        date: new Date(),
        vetName: recordVet.trim() || undefined,
        notes: recordNotes.trim() || undefined,
        attachments: [],
        createdAt: new Date(),
      };
      const id = await addHealthRecord(data);
      addRecord({ id, ...data });
      setRecordTitle('');
      setRecordVet('');
      setRecordNotes('');
      setShowRecordModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Semptom ekle
  const handleAddSymptom = async () => {
    if (!selectedPet || selectedSymptoms.length === 0) return;
    setLoading(true);
    try {
      const data = {
        petId: selectedPet.id,
        symptoms: selectedSymptoms,
        notes: symptomNotes.trim() || undefined,
        date: new Date(),
        aiWarning: selectedSymptoms.length >= 3,
        createdAt: new Date(),
      };
      const id = await addSymptomToDb(data);
      addSymptom({ id, ...data });
      setSelectedSymptoms([]);
      setSymptomNotes('');
      setShowSymptomModal(false);

      if (selectedSymptoms.length >= 3) {
        Alert.alert('Uyarı', 'Birden fazla belirti kaydedildi. Veterinerinize danışmanızı öneririz.');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>💊</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Sağlık takibi için önce bir hayvan ekle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
            {selectedPet.name} - Sağlık
          </Text>

          {/* Sağlık Skoru */}
          <Card>
            <View style={styles.scoreSection}>
              <HealthScoreRing score={healthScore.score} color={petColor} />
              <View style={styles.scoreCategories}>
                {healthScore.categories.map((cat) => (
                  <View key={cat.label} style={styles.categoryRow}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.categoryLabel, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                      {cat.label}
                    </Text>
                    <Text style={[styles.categoryScore, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                      {cat.score}/{cat.maxScore}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Eylem Butonları */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: `${petColor}15`, borderColor: petColor }]}
              onPress={() => setShowRecordModal(true)}
            >
              <Text style={{ fontSize: 20 }}>🏥</Text>
              <Text style={[styles.actionText, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                Kayıt Ekle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: `${theme.danger}15`, borderColor: theme.danger }]}
              onPress={() => setShowSymptomModal(true)}
            >
              <Text style={{ fontSize: 20 }}>🩺</Text>
              <Text style={[styles.actionText, { color: theme.danger, fontFamily: 'Nunito_700Bold' }]}>
                Belirti Ekle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Aktif İlaçlar */}
          {medications.length > 0 && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                💊 Aktif İlaçlar
              </Text>
              {medications.map((med) => (
                <View key={med.id} style={[styles.medRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.medName, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                      {med.name}
                    </Text>
                    <Text style={[styles.medDetail, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                      {med.dosage} • {med.frequency}
                    </Text>
                  </View>
                  <Text style={[styles.medTime, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                    {med.reminderTime}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Son Kayıtlar */}
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              📋 Son Kayıtlar
            </Text>
            {records.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                Henüz sağlık kaydı yok.
              </Text>
            ) : (
              records.slice(0, 5).map((rec) => {
                const typeInfo = RECORD_TYPES.find((r) => r.key === rec.type);
                return (
                  <TouchableOpacity
                    key={rec.id}
                    onLongPress={() => {
                      Alert.alert('Kaydı Sil', `"${rec.title}" silinsin mi?`, [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => { deleteHealthRecord(rec.id); removeRecord(rec.id); } },
                      ]);
                    }}
                  >
                    <View style={[styles.recordRow, { borderBottomColor: theme.border }]}>
                      <Text style={{ fontSize: 18 }}>{typeInfo?.icon || '📋'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.recordTitle, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                          {rec.title}
                        </Text>
                        {rec.vetName && (
                          <Text style={[styles.recordDetail, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                            {rec.vetName}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.recordDate, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                        {new Date(rec.date).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* Son Belirtiler */}
          {symptoms.length > 0 && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                🩺 Son Belirtiler
              </Text>
              {symptoms.slice(0, 3).map((s) => (
                <View key={s.id} style={[styles.symptomRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.symptomChips}>
                    {s.symptoms.map((sym) => {
                      const opt = SYMPTOM_OPTIONS.find((o) => o.key === sym);
                      return (
                        <View key={sym} style={[styles.symptomChip, { backgroundColor: `${theme.danger}10` }]}>
                          <Text style={{ fontSize: 12 }}>{opt?.icon}</Text>
                          <Text style={[styles.symptomChipText, { color: theme.danger, fontFamily: 'Nunito_700Bold' }]}>
                            {opt?.label || sym}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={[styles.recordDate, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                    {new Date(s.date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Kayıt Ekleme Modalı */}
      <Modal visible={showRecordModal} onClose={() => setShowRecordModal(false)} title="Sağlık Kaydı Ekle">
        <Text style={[styles.modalLabel, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>Tür</Text>
        <View style={styles.typeRow}>
          {RECORD_TYPES.map((rt) => (
            <TouchableOpacity
              key={rt.key}
              onPress={() => setRecordType(rt.key)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: recordType === rt.key ? `${petColor}20` : theme.surfaceAlt,
                  borderColor: recordType === rt.key ? petColor : theme.border,
                  borderWidth: recordType === rt.key ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>{rt.icon}</Text>
              <Text style={[styles.typeText, { color: recordType === rt.key ? petColor : theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                {rt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Başlık" placeholder="Yıllık kontrol" value={recordTitle} onChangeText={setRecordTitle} />
        <Input label="Veteriner" placeholder="Dr. Mehmet" value={recordVet} onChangeText={setRecordVet} />
        <Input label="Notlar" placeholder="Ek bilgi..." value={recordNotes} onChangeText={setRecordNotes} multiline />
        <Button title="Kaydet" onPress={handleAddRecord} loading={loading} />
      </Modal>

      {/* Belirti Ekleme Modalı */}
      <Modal visible={showSymptomModal} onClose={() => setShowSymptomModal(false)} title="Belirti Kaydet">
        <ScrollView style={{ maxHeight: 300 }}>
          <View style={styles.symptomGrid}>
            {SYMPTOM_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => toggleSymptom(opt.key)}
                style={[
                  styles.symptomOption,
                  {
                    backgroundColor: selectedSymptoms.includes(opt.key) ? `${theme.danger}15` : theme.surfaceAlt,
                    borderColor: selectedSymptoms.includes(opt.key) ? theme.danger : theme.border,
                    borderWidth: selectedSymptoms.includes(opt.key) ? 2 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{opt.icon}</Text>
                <Text style={[styles.symptomOptionText, { color: selectedSymptoms.includes(opt.key) ? theme.danger : theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Input label="Notlar" placeholder="Ek bilgi..." value={symptomNotes} onChangeText={setSymptomNotes} />
        <Button title={`${selectedSymptoms.length} Belirti Kaydet`} onPress={handleAddSymptom} loading={loading} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 24 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg, padding: SPACING.xl },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  scoreSection: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  scoreCategories: { flex: 1, gap: SPACING.sm },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { flex: 1, fontSize: 12 },
  categoryScore: { fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionText: { fontSize: 13 },
  sectionTitle: { fontSize: 16, marginBottom: SPACING.md },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  medName: { fontSize: 14 },
  medDetail: { fontSize: 11, marginTop: 2 },
  medTime: { fontSize: 12 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  recordTitle: { fontSize: 13 },
  recordDetail: { fontSize: 11, marginTop: 1 },
  recordDate: { fontSize: 11 },
  symptomRow: { paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  symptomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  symptomChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  symptomChipText: { fontSize: 10 },
  modalLabel: { fontSize: 13, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.sm },
  typeText: { fontSize: 11 },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  symptomOption: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.sm },
  symptomOptionText: { fontSize: 11 },
});
