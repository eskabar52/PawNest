// app/pet/edit/[id].tsx — Hayvan Profil Düzenleme
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../context/ThemeContext';
import { usePetStore } from '../../../store/petStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { updatePet } from '../../../services/firebase/pets';
import { uploadPetPhoto } from '../../../services/firebase/storage';
import { PET_TYPE_ICONS } from '../../../constants/config';
import { SPACING, RADIUS } from '../../../constants/fonts';
import { PetType, Gender } from '../../../types';

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

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, shared } = useTheme();
  const router = useRouter();
  const pets = usePetStore((s) => s.pets);
  const updatePetInStore = usePetStore((s) => s.updatePet);

  const pet = pets.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setType(pet.type);
      setBreed(pet.breed);
      setGender(pet.gender);
      setColor(pet.color);
      setWeight(pet.weight ? pet.weight.toString() : '');
      setIsNeutered(pet.isNeutered);
      setPhotoUri(pet.profilePhoto || null);
    }
  }, [pet]);

  if (!pet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.textMuted }}>Hayvan bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

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

    setLoading(true);
    try {
      let profilePhoto = pet.profilePhoto;

      // Yeni fotoğraf seçildiyse yükle
      if (photoUri && photoUri !== pet.profilePhoto) {
        profilePhoto = await uploadPetPhoto(photoUri, pet.id);
      }

      const updates = {
        name: name.trim(),
        type,
        breed: breed.trim(),
        gender,
        color: color.trim(),
        weight: parseFloat(weight) || 0,
        isNeutered,
        profilePhoto,
      };

      await updatePet(pet.id, updates);
      updatePetInStore(pet.id, updates);

      Alert.alert('Başarılı', 'Profil güncellendi!', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: shared.secondary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
            {pet.name} Düzenle
          </Text>
        </View>

        <View style={styles.form}>
          {/* Fotoğraf */}
          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={{ fontSize: 40 }}>{PET_TYPE_ICONS[pet.type]}</Text>
              </View>
            )}
            <Text style={[styles.changePhotoText, { color: shared.secondary, fontFamily: 'Nunito_700Bold' }]}>
              Fotoğrafı Değiştir
            </Text>
          </TouchableOpacity>

          <Input label="Hayvan Adı" value={name} onChangeText={setName} />

          {/* Tür */}
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>Tür</Text>
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
                <Text style={[styles.chipText, { color: type === pt.key ? shared.secondary : theme.textSecondary, fontFamily: type === pt.key ? 'Nunito_700Bold' : 'Nunito_400Regular' }]}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cinsiyet */}
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>Cinsiyet</Text>
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
                <Text style={[styles.chipText, { color: gender === g.key ? shared.secondary : theme.textSecondary, fontFamily: gender === g.key ? 'Nunito_700Bold' : 'Nunito_400Regular' }]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Irk" value={breed} onChangeText={setBreed} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Renk" value={color} onChangeText={setColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Kilo (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            </View>
          </View>

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
            <Text style={[styles.toggleText, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
              Kısırlaştırıldı
            </Text>
          </TouchableOpacity>

          <Button title="Kaydet" onPress={handleSave} loading={loading} />
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  backBtn: { fontSize: 16, fontFamily: 'Nunito_700Bold', marginBottom: SPACING.sm },
  title: { fontSize: 24 },
  form: { paddingHorizontal: SPACING.xl },
  photoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { fontSize: 13, marginTop: SPACING.sm },
  label: { fontSize: 13, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
  chipText: { fontSize: 13 },
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  genderChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  row: { flexDirection: 'row', gap: SPACING.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.xl },
  toggleText: { fontSize: 15 },
});
