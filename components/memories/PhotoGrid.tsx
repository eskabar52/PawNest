// components/memories/PhotoGrid.tsx — Fotoğraf Grid (Masonry)
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';
import { Photo } from '../../types';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 8;
const NUM_COLUMNS = 3;
const PHOTO_SIZE = (width - SPACING.xl * 2 - COLUMN_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface Props {
  photos: Photo[];
  onPhotoPress: (photo: Photo) => void;
  onPhotoLongPress?: (photo: Photo) => void;
}

export function PhotoGrid({ photos, onPhotoPress, onPhotoLongPress }: Props) {
  const { theme } = useTheme();

  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40 }}>📷</Text>
        <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
          Henüz fotoğraf yok
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          onPress={() => onPhotoPress(photo)}
          onLongPress={() => onPhotoLongPress?.(photo)}
          activeOpacity={0.8}
        >
          <View style={[styles.photoContainer, { borderColor: theme.border }]}>
            <Image source={{ uri: photo.url }} style={styles.photo} />
            {photo.isMilestone && (
              <View style={styles.milestoneTag}>
                <Text style={{ fontSize: 10 }}>⭐</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COLUMN_GAP,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  milestoneTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: SPACING.sm,
  },
  emptyText: { fontSize: 14 },
});
