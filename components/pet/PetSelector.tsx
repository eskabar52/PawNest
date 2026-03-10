// components/pet/PetSelector.tsx — Hayvan Seçici (Yatay Kaydırma)
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { usePetStore } from '../../store/petStore';
import { PetCard } from './PetCard';
import { SPACING, RADIUS } from '../../constants/fonts';

export function PetSelector() {
  const { theme } = useTheme();
  const router = useRouter();
  const { pets, selectedPetId, selectPet } = usePetStore();

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            isSelected={pet.id === selectedPetId}
            onPress={() => selectPet(pet.id)}
          />
        ))}

        {/* Yeni Hayvan Ekle Butonu */}
        <TouchableOpacity
          onPress={() => router.push('/pet/new')}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.addCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text
              style={[
                styles.addText,
                { color: theme.textMuted, fontFamily: 'Nunito_700Bold' },
              ]}
            >
              Ekle
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  addCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    height: 110,
  },
  addIcon: {
    fontSize: 28,
    color: '#A0AABB',
  },
  addText: {
    fontSize: 11,
    marginTop: 4,
  },
});
