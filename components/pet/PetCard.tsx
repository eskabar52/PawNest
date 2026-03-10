// components/pet/PetCard.tsx — Hayvan Kartı
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/fonts';
import { PET_TYPE_ICONS, PET_TYPE_LABELS } from '../../constants/config';
import { Pet } from '../../types';

interface PetCardProps {
  pet: Pet;
  isSelected?: boolean;
  onPress?: () => void;
}

export function PetCard({ pet, isSelected = false, onPress }: PetCardProps) {
  const { theme, shared } = useTheme();
  const router = useRouter();
  const petColor = COLORS.petColors[pet.type] || COLORS.petColors.other;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/pet/${pet.id}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? petColor : theme.border,
            borderWidth: isSelected ? 2 : 1,
          },
          SHADOWS.card,
        ]}
      >
        {/* Avatar */}
        {pet.profilePhoto ? (
          <Image source={{ uri: pet.profilePhoto }} style={[styles.avatar, { borderColor: petColor }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: `${petColor}15`, borderColor: petColor }]}>
            <Text style={{ fontSize: 24 }}>{PET_TYPE_ICONS[pet.type]}</Text>
          </View>
        )}

        {/* Bilgi */}
        <Text
          style={[styles.name, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}
          numberOfLines={1}
        >
          {pet.name}
        </Text>
        <Text
          style={[styles.breed, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}
          numberOfLines={1}
        >
          {pet.breed || PET_TYPE_LABELS[pet.type]}
        </Text>

        {/* Seçili göstergesi */}
        {isSelected && (
          <View style={[styles.selectedDot, { backgroundColor: petColor }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  breed: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});
