// app/family.tsx — Aile Yönetimi Ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { usePetStore } from '../store/petStore';
import { useFamilyStore } from '../store/familyStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  onPetFamilyChanged,
  onPetActivityChanged,
  addFamilyMember,
  removeFamilyMember,
  updateFamilyMemberRole,
  FamilyMember,
} from '../services/firebase/family';
import { COLORS } from '../constants/colors';
import { SPACING, RADIUS } from '../constants/fonts';

const ROLES: { key: FamilyMember['role']; label: string; icon: string }[] = [
  { key: 'owner', label: 'Sahip', icon: '👑' },
  { key: 'caretaker', label: 'Bakıcı', icon: '🤝' },
  { key: 'viewer', label: 'İzleyici', icon: '👁️' },
];

export default function FamilyScreen() {
  const { theme, shared } = useTheme();
  const user = useUserStore((s) => s.user);
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const { members, activities, setMembers, addMember, removeMember: removeFromStore, setActivities } = useFamilyStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<FamilyMember['role']>('caretaker');
  const [loading, setLoading] = useState(false);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  useEffect(() => {
    if (!selectedPet) return;
    const unsub1 = onPetFamilyChanged(selectedPet.id, setMembers);
    const unsub2 = onPetActivityChanged(selectedPet.id, setActivities);
    return () => { unsub1(); unsub2(); };
  }, [selectedPet?.id]);

  // Üye davet et
  const handleInvite = async () => {
    if (!selectedPet || !user || !inviteEmail.trim()) return;
    setLoading(true);
    try {
      const data = {
        petId: selectedPet.id,
        userId: inviteEmail.trim(), // Gerçekte uid olacak
        displayName: inviteName.trim() || inviteEmail.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        joinedAt: new Date(),
      };
      const id = await addFamilyMember(data);
      addMember({ id, ...data });
      setInviteEmail('');
      setInviteName('');
      setShowInviteModal(false);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Üye çıkar
  const handleRemoveMember = (member: FamilyMember) => {
    Alert.alert('Üyeyi Çıkar', `${member.displayName} çıkarılsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar',
        style: 'destructive',
        onPress: async () => {
          await removeFamilyMember(member.id);
          removeFromStore(member.id);
        },
      },
    ]);
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>👨‍👩‍👧‍👦</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            Aile yönetimi için önce bir hayvan ekle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backBtn, { color: theme.textMuted }]}>← Geri</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              Aile Yönetimi
            </Text>
          </View>

          {/* Üye Sayısı */}
          <View style={[styles.statRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
            <View>
              <Text style={[styles.statNum, { color: petColor, fontFamily: 'Nunito_800ExtraBold' }]}>
                {members.length + 1}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                aile üyesi
              </Text>
            </View>
          </View>

          {/* Aile Üyeleri */}
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              Üyeler
            </Text>

            {/* Mevcut kullanıcı (sahip) */}
            <View style={[styles.memberRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.memberAvatar, { backgroundColor: `${petColor}20` }]}>
                <Text style={{ fontSize: 16 }}>👑</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                  {user?.displayName || 'Sen'} (Sen)
                </Text>
                <Text style={[styles.memberRole, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                  Sahip
                </Text>
              </View>
            </View>

            {/* Diğer üyeler */}
            {members.map((member) => {
              const roleInfo = ROLES.find((r) => r.key === member.role);
              return (
                <TouchableOpacity key={member.id} onLongPress={() => handleRemoveMember(member)}>
                  <View style={[styles.memberRow, { borderBottomColor: theme.border }]}>
                    <View style={[styles.memberAvatar, { backgroundColor: theme.surfaceAlt }]}>
                      <Text style={{ fontSize: 16 }}>{roleInfo?.icon || '👤'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.memberName, { color: theme.textPrimary, fontFamily: 'Nunito_700Bold' }]}>
                        {member.displayName}
                      </Text>
                      <Text style={[styles.memberRole, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                        {roleInfo?.label} • {member.email}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Aktivite Akışı */}
          {activities.length > 0 && (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                📋 Son Aktiviteler
              </Text>
              {activities.slice(0, 10).map((act) => (
                <View key={act.id} style={[styles.activityRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityText, { color: theme.textPrimary, fontFamily: 'Nunito_400Regular' }]}>
                      <Text style={{ fontFamily: 'Nunito_700Bold' }}>{act.userName}</Text> {act.action}
                    </Text>
                    {act.detail && (
                      <Text style={[styles.activityDetail, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
                        {act.detail}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.activityTime, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                    {new Date(act.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Davet Butonu */}
          <Button title="+ Aile Üyesi Davet Et" onPress={() => setShowInviteModal(true)} />
        </View>
      </ScrollView>

      {/* Davet Modalı */}
      <Modal visible={showInviteModal} onClose={() => setShowInviteModal(false)} title="Aile Üyesi Davet Et">
        <Input label="E-posta" placeholder="ornek@email.com" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" />
        <Input label="Ad" placeholder="Üyenin adı" value={inviteName} onChangeText={setInviteName} />

        <Text style={[styles.modalLabel, { color: theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>Rol</Text>
        <View style={styles.roleRow}>
          {ROLES.filter((r) => r.key !== 'owner').map((role) => (
            <TouchableOpacity
              key={role.key}
              onPress={() => setInviteRole(role.key)}
              style={[
                styles.roleBtn,
                {
                  backgroundColor: inviteRole === role.key ? `${petColor}20` : theme.surfaceAlt,
                  borderColor: inviteRole === role.key ? petColor : theme.border,
                  borderWidth: inviteRole === role.key ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{role.icon}</Text>
              <Text style={[styles.roleBtnText, { color: inviteRole === role.key ? petColor : theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Davet Gönder" onPress={handleInvite} loading={loading} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  backBtn: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  title: { fontSize: 22 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg, padding: SPACING.xl },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  statNum: { fontSize: 24 },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 16, marginBottom: SPACING.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 14 },
  memberRole: { fontSize: 11, marginTop: 1 },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 0.5 },
  activityText: { fontSize: 13 },
  activityDetail: { fontSize: 11, marginTop: 2 },
  activityTime: { fontSize: 10 },
  modalLabel: { fontSize: 13, marginBottom: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: SPACING.md, borderRadius: RADIUS.sm },
  roleBtnText: { fontSize: 11 },
});
