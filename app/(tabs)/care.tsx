// app/(tabs)/care.tsx — Bakım Rutinleri Ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';
import { useCareStore } from '../../store/careStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TaskItem } from '../../components/care/TaskItem';
import { StreakBadge } from '../../components/care/StreakBadge';
import {
  onPetCareTasksChanged,
  addCareTask,
  completeCareTask,
  uncompleteCareTask,
  deleteCareTask,
  DEFAULT_CARE_TASKS,
} from '../../services/firebase/care';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/fonts';
import { CareFrequency, CareTask } from '../../types';

const TABS: { key: CareFrequency; label: string }[] = [
  { key: 'daily', label: 'Günlük' },
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
  { key: 'yearly', label: 'Yıllık' },
];

export default function CareScreen() {
  const { theme, shared } = useTheme();
  const user = useUserStore((s) => s.user);
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const { tasks, activeTab, setTasks, setActiveTab, addTask, updateTask, removeTask } = useCareStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('📌');
  const [newTaskTime, setNewTaskTime] = useState('09:00');

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  // Görevleri dinle
  useEffect(() => {
    if (!selectedPet) return;
    const unsubscribe = onPetCareTasksChanged(selectedPet.id, (fetchedTasks) => {
      setTasks(fetchedTasks);
    });
    return unsubscribe;
  }, [selectedPet?.id]);

  const filteredTasks = tasks.filter((t) => t.frequency === activeTab);
  const completedCount = filteredTasks.filter((t) => t.isCompleted).length;
  const completionRate = filteredTasks.length > 0
    ? Math.round((completedCount / filteredTasks.length) * 100)
    : 0;

  // Görev tamamla/geri al
  const handleToggle = async (task: CareTask) => {
    if (!user) return;
    try {
      if (task.isCompleted) {
        await uncompleteCareTask(task.id);
        updateTask(task.id, { isCompleted: false, completedAt: undefined, completedBy: undefined });
      } else {
        await completeCareTask(task.id, user.id);
        updateTask(task.id, { isCompleted: true, completedAt: new Date(), completedBy: user.id });
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  // Görev sil
  const handleLongPress = (task: CareTask) => {
    Alert.alert(
      'Görevi Sil',
      `"${task.title}" görevini silmek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCareTask(task.id);
              removeTask(task.id);
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            }
          },
        },
      ]
    );
  };

  // Varsayılan görevleri ekle
  const handleAddDefaults = async () => {
    if (!selectedPet || !user) return;
    const defaults = DEFAULT_CARE_TASKS[selectedPet.type] || DEFAULT_CARE_TASKS.other;
    try {
      for (const template of defaults) {
        const taskData = {
          petId: selectedPet.id,
          title: template.title,
          icon: template.icon,
          frequency: template.frequency,
          scheduledTime: template.scheduledTime,
          isCompleted: false,
          isCustom: false,
          createdAt: new Date(),
        };
        const id = await addCareTask(taskData);
        addTask({ id, ...taskData });
      }
      Alert.alert('Başarılı', 'Varsayılan görevler eklendi!');
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  // Özel görev ekle
  const handleAddCustomTask = async () => {
    if (!selectedPet || !user || !newTaskTitle.trim()) return;
    try {
      const taskData = {
        petId: selectedPet.id,
        title: newTaskTitle.trim(),
        icon: newTaskIcon,
        frequency: activeTab,
        scheduledTime: newTaskTime,
        isCompleted: false,
        isCustom: true,
        createdAt: new Date(),
      };
      const id = await addCareTask(taskData);
      addTask({ id, ...taskData });
      setNewTaskTitle('');
      setShowAddModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  // Hayvan seçili değilse
  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Bakım görevlerini görmek için önce bir hayvan ekle.
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
            {selectedPet.name} - Bakım
          </Text>

          {/* Streak Badge */}
          <StreakBadge streak={0} completionRate={completionRate} />

          {/* Tab Seçici */}
          <View style={[styles.tabRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tab,
                  activeTab === tab.key && { backgroundColor: petColor },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab.key ? '#FFFFFF' : theme.textMuted,
                      fontFamily: activeTab === tab.key ? 'Nunito_700Bold' : 'Nunito_400Regular',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* İlerleme Çubuğu */}
          {filteredTasks.length > 0 && (
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
                {completedCount}/{filteredTasks.length} tamamlandı
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: petColor, width: `${completionRate}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Görev Listesi */}
          {filteredTasks.length > 0 ? (
            <View style={styles.taskList}>
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  petColor={petColor}
                  onToggle={handleToggle}
                  onLongPress={handleLongPress}
                />
              ))}
            </View>
          ) : tasks.length === 0 ? (
            <Card>
              <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>📋</Text>
              <Text style={[styles.emptyTaskText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Henüz görev yok. Varsayılan görevleri ekleyerek başla!
              </Text>
              <View style={{ marginTop: SPACING.lg }}>
                <Button title="Varsayılan Görevleri Ekle" onPress={handleAddDefaults} />
              </View>
            </Card>
          ) : (
            <Card>
              <Text style={[styles.emptyTaskText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                Bu kategoride görev yok.
              </Text>
            </Card>
          )}

          {/* Özel Görev Ekle Butonu */}
          <Button
            title="+ Özel Görev Ekle"
            onPress={() => setShowAddModal(true)}
            variant="secondary"
          />
        </View>
      </ScrollView>

      {/* Özel Görev Ekleme Modalı */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)} title="Özel Görev Ekle">
        <Input
          label="Görev Adı"
          placeholder="Örn: Vitamin ver"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />

        {/* İkon Seçimi */}
        <Text style={[styles.modalLabel, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
          İkon
        </Text>
        <View style={styles.iconRow}>
          {['📌', '💊', '🍽️', '💧', '🛁', '🪮', '✂️', '🦷', '🎾', '🧹'].map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setNewTaskIcon(icon)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: newTaskIcon === icon ? `${petColor}20` : theme.surfaceAlt,
                  borderColor: newTaskIcon === icon ? petColor : theme.border,
                  borderWidth: newTaskIcon === icon ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Saat"
          placeholder="09:00"
          value={newTaskTime}
          onChangeText={setNewTaskTime}
        />

        <Button title="Ekle" onPress={handleAddCustomTask} />
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
  tabRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  tabText: { fontSize: 12 },
  progressContainer: { gap: 6 },
  progressText: { fontSize: 12 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskList: { gap: 0 },
  emptyTaskText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  modalLabel: { fontSize: 13, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
