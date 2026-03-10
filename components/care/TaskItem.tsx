// components/care/TaskItem.tsx — Görev Satırı
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';
import { CareTask } from '../../types';

interface TaskItemProps {
  task: CareTask;
  petColor: string;
  onToggle: (task: CareTask) => void;
  onLongPress?: (task: CareTask) => void;
}

export function TaskItem({ task, petColor, onToggle, onLongPress }: TaskItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle(task);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={() => onLongPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Checkbox */}
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: task.isCompleted ? petColor : 'transparent',
              borderColor: task.isCompleted ? 'transparent' : theme.border,
            },
            animatedStyle,
          ]}
        >
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </Animated.View>

        {/* İkon */}
        <Text style={styles.icon}>{task.icon}</Text>

        {/* Bilgi */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: task.isCompleted ? theme.textMuted : theme.textPrimary,
                fontFamily: 'Nunito_700Bold',
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>
          {task.isCompleted && task.completedBy && (
            <Text style={[styles.completedBy, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
              ✓ tamamlandı
            </Text>
          )}
        </View>

        {/* Saat */}
        <Text style={[styles.time, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
          {task.scheduledTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 13,
    fontWeight: '900',
  },
  icon: { fontSize: 18 },
  title: { fontSize: 14 },
  completedBy: { fontSize: 10, marginTop: 1 },
  time: { fontSize: 12 },
});
