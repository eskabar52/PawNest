// app/pet/[id].tsx — Hayvan Profil Detay Sayfası
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { usePetStore } from '../../store/petStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { deletePet } from '../../services/firebase/pets';
import { PET_TYPE_LABELS, PET_TYPE_ICONS } from '../../constants/config';
import { SPACING, RADIUS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';

export default function PetProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, shared } = useTheme();
  const router = useRouter();
  const pets = usePetStore((s) => s.pets);
  const removePet = usePetStore((s) => s.removePet);

  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Hayvan bulunamadı
          </Text>
          <Button title="Geri Dön" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const petColor = COLORS.petColors[pet.type] || COLORS.petColors.other;

  const parseBirthDate = (birthDate: any): Date | null => {
    if (!birthDate) return null;
    if (birthDate?.toDate && typeof birthDate.toDate === 'function') return birthDate.toDate();
    if (birthDate?.seconds) return new Date(birthDate.seconds * 1000);
    const d = new Date(birthDate);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatBirthDate = (birthDate: any): string => {
    const d = parseBirthDate(birthDate);
    if (!d) return 'Belirtilmedi';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calculateAge = (birthDate: any): string => {
    const birth = parseBirthDate(birthDate);
    if (!birth) return 'Doğum tarihi belirtilmedi';

    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return 'Yeni doğan';
    if (months < 12) return `${months} aylık`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} yaşında`;
    return `${years} yıl ${remainingMonths} ay`;
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Hayvanı Sil',
      `${pet.name} adlı hayvanı silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet(id);
              removePet(id);
              router.replace('/');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Silinemedi.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: shared.secondary }]}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* Profil Fotoğrafı ve İsim */}
        <View style={styles.profileSection}>
          {pet.profilePhoto ? (
            <Image source={{ uri: pet.profilePhoto }} style={[styles.avatar, { borderColor: petColor }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: `${petColor}20`, borderColor: petColor }]}>
              <Text style={{ fontSize: 48 }}>{PET_TYPE_ICONS[pet.type]}</Text>
            </View>
          )}
          <Text style={[styles.petName, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
            {pet.name}
          </Text>
          <Text style={[styles.petBreed, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            {pet.breed || PET_TYPE_LABELS[pet.type]} • {calculateAge(pet.birthDate)}
          </Text>
        </View>

        {/* Bilgi Kartları */}
        <View style={styles.content}>
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              Temel Bilgiler
            </Text>
            <View style={styles.infoGrid}>
              <InfoRow label="Tür" value={`${PET_TYPE_ICONS[pet.type]} ${PET_TYPE_LABELS[pet.type]}`} theme={theme} />
              <InfoRow label="Irk" value={pet.breed || '-'} theme={theme} />
              <InfoRow label="Cinsiyet" value={pet.gender === 'female' ? '♀️ Dişi' : '♂️ Erkek'} theme={theme} />
              <InfoRow label="Renk" value={pet.color || '-'} theme={theme} />
              <InfoRow label="Doğum Tarihi" value={formatBirthDate(pet.birthDate)} theme={theme} />
              <InfoRow label="Yaş" value={calculateAge(pet.birthDate)} theme={theme} />
              <InfoRow label="Kilo" value={pet.weight ? `${pet.weight} kg` : '-'} theme={theme} />
              <InfoRow label="Kısırlaştırma" value={pet.isNeutered ? '✅ Evet' : '❌ Hayır'} theme={theme} />
            </View>
          </Card>

          {/* Eylem Butonları */}
          <Button
            title="Profili Düzenle"
            onPress={() => router.push(`/pet/edit/${pet.id}`)}
          />

          <Button
            title="Hayvanı Sil"
            onPress={handleDelete}
            variant="secondary"
          />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.textPrimary, fontFamily: 'Nunito_400Regular' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  emptyText: { fontSize: 16, fontFamily: 'Nunito_400Regular' },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backBtn: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: {
    fontSize: 26,
    marginTop: SPACING.md,
  },
  petBreed: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  infoGrid: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13 },
});
