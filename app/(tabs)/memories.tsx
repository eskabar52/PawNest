// app/(tabs)/memories.tsx — Anılar & Albüm Ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';
import { useMemoriesStore } from '../../store/memoriesStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PhotoGrid } from '../../components/memories/PhotoGrid';
import { Timeline } from '../../components/memories/Timeline';
import {
  onPetPhotosChanged,
  onPetMilestonesChanged,
  uploadPhoto,
  deletePhoto,
  addMilestone as addMilestoneToDb,
  deleteMilestone as deleteMilestoneFromDb,
  MILESTONE_TEMPLATES,
} from '../../services/firebase/photos';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/fonts';
import { Photo, MilestoneType } from '../../types';

export default function MemoriesScreen() {
  const { theme, shared } = useTheme();
  const user = useUserStore((s) => s.user);
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const {
    photos, milestones, viewMode,
    setPhotos, addPhoto, removePhoto,
    setMilestones, addMilestone, removeMilestone,
    setViewMode,
  } = useMemoriesStore();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showPreview, setShowPreview] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('custom');
  const [milestonePhoto, setMilestonePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  // Verileri dinle
  useEffect(() => {
    if (!selectedPet) return;
    const unsub1 = onPetPhotosChanged(selectedPet.id, setPhotos);
    const unsub2 = onPetMilestonesChanged(selectedPet.id, setMilestones);
    return () => { unsub1(); unsub2(); };
  }, [selectedPet?.id]);

  // Fotoğraf seç
  const pickImage = async (forMilestone = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      if (forMilestone) {
        setMilestonePhoto(result.assets[0].uri);
      } else {
        setSelectedImage(result.assets[0].uri);
      }
    }
  };

  // Fotoğraf yükle
  const handleUploadPhoto = async () => {
    if (!selectedPet || !user || !selectedImage) return;
    setLoading(true);
    try {
      const id = await uploadPhoto(selectedPet.id, user.id, selectedImage, caption.trim());
      addPhoto({
        id,
        petId: selectedPet.id,
        url: selectedImage,
        caption: caption.trim(),
        isMilestone: false,
        takenAt: new Date(),
        uploadedBy: user.id,
        createdAt: new Date(),
      });
      setSelectedImage(null);
      setCaption('');
      setShowPhotoModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fotoğraf sil
  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert('Fotoğrafı Sil', 'Bu fotoğrafı silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhoto(photo.id, photo.url);
            removePhoto(photo.id);
            setShowPreview(null);
          } catch (error: any) {
            Alert.alert('Hata', error.message);
          }
        },
      },
    ]);
  };

  // Kilometre taşı ekle
  const handleAddMilestone = async () => {
    if (!selectedPet || !milestoneTitle.trim()) return;
    setLoading(true);
    try {
      const data = {
        petId: selectedPet.id,
        type: milestoneType,
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim() || undefined,
        date: new Date(),
        photoUrl: milestonePhoto || undefined,
        createdAt: new Date(),
      };
      const id = await addMilestoneToDb(data);
      addMilestone({ id, ...data });
      setMilestoneTitle('');
      setMilestoneDesc('');
      setMilestoneType('custom');
      setMilestonePhoto(null);
      setShowMilestoneModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>📸</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Anıları görmek için önce bir hayvan ekle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Başlık */}
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
            {selectedPet.name} - Anılar
          </Text>

          {/* Sayaçlar */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 18 }}>📷</Text>
              <Text style={[styles.statNum, { color: petColor, fontFamily: 'Nunito_800ExtraBold' }]}>
                {photos.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                fotoğraf
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 18 }}>🏆</Text>
              <Text style={[styles.statNum, { color: petColor, fontFamily: 'Nunito_800ExtraBold' }]}>
                {milestones.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                kilometre taşı
              </Text>
            </View>
          </View>

          {/* Görünüm Seçici */}
          <View style={[styles.viewToggle, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: petColor }]}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'grid' ? '#FFF' : theme.textMuted, fontFamily: viewMode === 'grid' ? 'Nunito_700Bold' : 'Nunito_400Regular' }]}>
                📷 Fotoğraflar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('timeline')}
              style={[styles.toggleBtn, viewMode === 'timeline' && { backgroundColor: petColor }]}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'timeline' ? '#FFF' : theme.textMuted, fontFamily: viewMode === 'timeline' ? 'Nunito_700Bold' : 'Nunito_400Regular' }]}>
                🏆 Zaman Tüneli
              </Text>
            </TouchableOpacity>
          </View>

          {/* İçerik */}
          {viewMode === 'grid' ? (
            <>
              <PhotoGrid
                photos={photos}
                onPhotoPress={(p) => setShowPreview(p)}
                onPhotoLongPress={handleDeletePhoto}
              />
              <Button
                title="+ Fotoğraf Ekle"
                onPress={() => { setShowPhotoModal(true); pickImage(); }}
                variant="secondary"
              />
            </>
          ) : (
            <>
              <Timeline
                milestones={milestones}
                petColor={petColor}
                onLongPress={(ms) => {
                  Alert.alert('Sil', `"${ms.title}" silinsin mi?`, [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Sil', style: 'destructive', onPress: () => { deleteMilestoneFromDb(ms.id); removeMilestone(ms.id); } },
                  ]);
                }}
              />
              <Button
                title="+ Kilometre Taşı Ekle"
                onPress={() => setShowMilestoneModal(true)}
                variant="secondary"
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Fotoğraf Önizleme */}
      {showPreview && (
        <Modal visible={!!showPreview} onClose={() => setShowPreview(null)} title="Fotoğraf">
          <Image source={{ uri: showPreview.url }} style={styles.previewImage} resizeMode="contain" />
          {showPreview.caption ? (
            <Text style={[styles.previewCaption, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
              {showPreview.caption}
            </Text>
          ) : null}
          <Text style={[styles.previewDate, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
            {new Date(showPreview.takenAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Button title="Sil" onPress={() => handleDeletePhoto(showPreview)} variant="secondary" />
        </Modal>
      )}

      {/* Fotoğraf Ekleme Modalı */}
      <Modal visible={showPhotoModal} onClose={() => { setShowPhotoModal(false); setSelectedImage(null); }} title="Fotoğraf Ekle">
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.selectedPreview} resizeMode="cover" />
        ) : (
          <TouchableOpacity
            onPress={() => pickImage()}
            style={[styles.pickArea, { borderColor: theme.border }]}
          >
            <Text style={{ fontSize: 32 }}>📷</Text>
            <Text style={[styles.pickText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
              Fotoğraf seç
            </Text>
          </TouchableOpacity>
        )}
        <Input label="Açıklama" placeholder="Bu anı hakkında..." value={caption} onChangeText={setCaption} />
        <Button title="Yükle" onPress={handleUploadPhoto} loading={loading} />
      </Modal>

      {/* Kilometre Taşı Modalı */}
      <Modal visible={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Kilometre Taşı Ekle">
        <Text style={[styles.modalLabel, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
          Tür
        </Text>
        <View style={styles.milestoneTypeGrid}>
          {MILESTONE_TEMPLATES.map((tmpl) => (
            <TouchableOpacity
              key={tmpl.type}
              onPress={() => { setMilestoneType(tmpl.type); setMilestoneTitle(tmpl.title); }}
              style={[
                styles.milestoneTypeBtn,
                {
                  backgroundColor: milestoneType === tmpl.type ? `${petColor}20` : theme.surfaceAlt,
                  borderColor: milestoneType === tmpl.type ? petColor : theme.border,
                  borderWidth: milestoneType === tmpl.type ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{tmpl.icon}</Text>
              <Text style={[styles.milestoneTypeText, { color: milestoneType === tmpl.type ? petColor : theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                {tmpl.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Başlık" placeholder="Özel bir an..." value={milestoneTitle} onChangeText={setMilestoneTitle} />
        <Input label="Açıklama" placeholder="Bu anı hakkında..." value={milestoneDesc} onChangeText={setMilestoneDesc} multiline />

        {milestonePhoto ? (
          <Image source={{ uri: milestonePhoto }} style={styles.milestonePreview} resizeMode="cover" />
        ) : (
          <TouchableOpacity
            onPress={() => pickImage(true)}
            style={[styles.pickAreaSmall, { borderColor: theme.border }]}
          >
            <Text style={{ fontSize: 16 }}>📷</Text>
            <Text style={[styles.pickText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
              Fotoğraf ekle (opsiyonel)
            </Text>
          </TouchableOpacity>
        )}

        <Button title="Kaydet" onPress={handleAddMilestone} loading={loading} />
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
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 2,
  },
  statNum: { fontSize: 20 },
  statLabel: { fontSize: 10 },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  toggleText: { fontSize: 12 },
  previewImage: { width: '100%', height: 300, borderRadius: RADIUS.md },
  previewCaption: { fontSize: 14, marginTop: SPACING.sm, textAlign: 'center' },
  previewDate: { fontSize: 12, textAlign: 'center', marginBottom: SPACING.md },
  selectedPreview: { width: '100%', height: 200, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  pickArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    padding: 30,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pickAreaSmall: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.sm,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pickText: { fontSize: 13 },
  modalLabel: { fontSize: 13, marginBottom: SPACING.sm },
  milestoneTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  milestoneTypeBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    minWidth: 70,
  },
  milestoneTypeText: { fontSize: 9 },
  milestonePreview: { width: '100%', height: 120, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
});
