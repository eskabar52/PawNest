// app/pet/new.tsx — Yeni Hayvan Ekleme Formu
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { addPet } from '../../services/firebase/pets';
import { uploadPetPhoto } from '../../services/firebase/storage';
import { PET_TYPE_LABELS, PET_TYPE_ICONS } from '../../constants/config';
import { SPACING, RADIUS } from '../../constants/fonts';
import { PetType, Gender } from '../../types';

const PET_TYPES: { key: PetType; label: string; icon: string }[] = [
  { key: 'dog', label: 'Köpek', icon: '🐕' },
  { key: 'cat', label: 'Kedi', icon: '🐈' },
  { key: 'rabbit', label: 'Tavşan', icon: '🐇' },
  { key: 'hamster', label: 'Hamster', icon: '🐹' },
  { key: 'bird', label: 'Kuş', icon: '🐦' },
  { key: 'other', label: 'Diğer', icon: '🐾' },
];

const GENDERS: { key: Gender; label: string; icon: string }[] = [
  { key: 'female', label: 'Dişi', icon: '♀️' },
  { key: 'male', label: 'Erkek', icon: '♂️' },
];

export default function NewPetScreen() {
  const { theme, shared } = useTheme();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const addPetToStore = usePetStore((s) => s.addPet);

  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [birthDate, setBirthDate] = useState('');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Hayvan adı gerekli.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      // Geçici ID oluştur (Firebase'den gerçek ID gelecek)
      const tempId = Date.now().toString();

      // Fotoğraf yükle
      let profilePhoto: string | undefined;
      if (photoUri) {
        profilePhoto = await uploadPetPhoto(photoUri, tempId);
      }

      // Doğum tarihi parse
      let parsedBirthDate = new Date();
      if (birthDate) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          parsedBirthDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0])
          );
        }
      }

      const petData = {
        ownerId: user.id,
        name: name.trim(),
        type,
        breed: breed.trim(),
        gender,
        birthDate: parsedBirthDate,
        color: color.trim(),
        weight: parseFloat(weight) || 0,
        isNeutered,
        profilePhoto,
        familyMembers: [user.id],
        createdAt: new Date(),
      };

      const petId = await addPet(petData);

      addPetToStore({ id: petId, ...petData });

      Alert.alert('Başarılı', `${name} eklendi!`, [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Hayvan eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: shared.secondary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
            Yeni Hayvan Ekle
          </Text>
        </View>

        <View style={styles.form}>
          {/* Fotoğraf */}
          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={[styles.photoText, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                  Fotoğraf Ekle
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* İsim */}
          <Input
            label="Hayvan Adı"
            placeholder="Luna, Max, Boncuk..."
            value={name}
            onChangeText={setName}
          />

          {/* Tür Seçimi */}
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
            Tür
          </Text>
          <View style={styles.chipRow}>
            {PET_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.key}
                onPress={() => setType(pt.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: type === pt.key ? `${shared.secondary}20` : theme.surfaceAlt,
                    borderColor: type === pt.key ? shared.secondary : theme.border,
                    borderWidth: type === pt.key ? 2 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{pt.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: type === pt.key ? shared.secondary : theme.textSecondary,
                      fontFamily: type === pt.key ? 'Nunito_700Bold' : 'Nunito_400Regular',
                    },
                  ]}
                >
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cinsiyet */}
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
            Cinsiyet
          </Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.key}
                onPress={() => setGender(g.key)}
                style={[
                  styles.genderChip,
                  {
                    backgroundColor: gender === g.key ? `${shared.secondary}20` : theme.surfaceAlt,
                    borderColor: gender === g.key ? shared.secondary : theme.border,
                    borderWidth: gender === g.key ? 2 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{g.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: gender === g.key ? shared.secondary : theme.textSecondary,
                      fontFamily: gender === g.key ? 'Nunito_700Bold' : 'Nunito_400Regular',
                    },
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Irk */}
          <Input
            label="Irk"
            placeholder="Golden Retriever, British Shorthair..."
            value={breed}
            onChangeText={setBreed}
          />

          {/* Doğum Tarihi */}
          <Input
            label="Doğum Tarihi"
            placeholder="GG/AA/YYYY"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />

          {/* Renk & Kilo */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Renk"
                placeholder="Siyah, Beyaz..."
                value={color}
                onChangeText={setColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Kilo (kg)"
                placeholder="5.5"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Kısırlaştırma */}
          <TouchableOpacity
            onPress={() => setIsNeutered(!isNeutered)}
            style={[
              styles.toggleRow,
              {
                backgroundColor: isNeutered ? `${shared.secondary}15` : theme.surfaceAlt,
                borderColor: isNeutered ? shared.secondary : theme.border,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{isNeutered ? '✅' : '⬜'}</Text>
            <Text
              style={[
                styles.toggleText,
                { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' },
              ]}
            >
              Kısırlaştırıldı
            </Text>
          </TouchableOpacity>

          {/* Kaydet */}
          <Button title="Hayvanı Kaydet" onPress={handleSave} loading={loading} />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    marginBottom: SPACING.sm,
  },
  title: { fontSize: 24 },
  form: { paddingHorizontal: SPACING.xl },
  photoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontSize: 11, marginTop: 4 },
  label: {
    fontSize: 13,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  chipText: { fontSize: 13 },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  toggleText: { fontSize: 15 },
});
