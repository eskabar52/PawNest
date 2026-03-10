// app/(tabs)/assistant.tsx — AI Asistan Ekranı
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';
import { useChatStore } from '../../store/chatStore';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { sendMessage, getQuickQuestions } from '../../services/ai/assistant';
import { saveChatMessage, onChatMessagesChanged, clearChatHistory } from '../../services/firebase/chat';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/fonts';

export default function AssistantScreen() {
  const { theme, shared } = useTheme();
  const user = useUserStore((s) => s.user);
  const selectedPet = usePetStore((s) => s.selectedPet)();
  const { messages, isTyping, setMessages, addMessage, clearMessages, setIsTyping } = useChatStore();

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const petColor = selectedPet
    ? COLORS.petColors[selectedPet.type] || COLORS.petColors.other
    : shared.secondary;

  // Mesaj geçmişini dinle
  useEffect(() => {
    if (!user || !selectedPet) return;
    const unsub = onChatMessagesChanged(user.id, selectedPet.id, setMessages);
    return unsub;
  }, [user?.id, selectedPet?.id]);

  // Otomatik scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length, isTyping]);

  // Mesaj gönder
  const handleSend = async (text?: string) => {
    const msg = (text || inputText).trim();
    if (!msg || !selectedPet || !user) return;
    setInputText('');

    const userMsg = { role: 'user' as const, content: msg, timestamp: new Date() };
    addMessage(userMsg);
    saveChatMessage(user.id, selectedPet.id, userMsg);

    setIsTyping(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendMessage(
        { apiKey: 'demo', pet: selectedPet },
        msg,
        history
      );
      const assistantMsg = { role: 'assistant' as const, content: response, timestamp: new Date() };
      addMessage(assistantMsg);
      saveChatMessage(user.id, selectedPet.id, assistantMsg);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setIsTyping(false);
    }
  };

  // Sohbeti temizle
  const handleClear = () => {
    if (!user || !selectedPet) return;
    Alert.alert('Sohbeti Temizle', 'Tüm mesajlar silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Temizle',
        style: 'destructive',
        onPress: () => {
          clearChatHistory(user.id, selectedPet.id);
          clearMessages();
        },
      },
    ]);
  };

  const quickQuestions = selectedPet ? getQuickQuestions(selectedPet) : [];

  if (!selectedPet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>🤖</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
            AI Asistanı kullanmak için önce bir hayvan ekle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={[styles.headerAvatar, { backgroundColor: `${petColor}20` }]}>
            <Text style={{ fontSize: 18 }}>🐾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
              PawBot
            </Text>
            <Text style={[styles.headerSub, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
              {selectedPet.name} için AI asistan
            </Text>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Text style={[styles.clearBtn, { color: theme.textMuted }]}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Mesajlar */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageArea}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeSection}>
              <Text style={{ fontSize: 40, textAlign: 'center' }}>🤖</Text>
              <Text style={[styles.welcomeTitle, { color: theme.textPrimary, fontFamily: 'Syne_700Bold' }]}>
                Merhaba! Ben PawBot
              </Text>
              <Text style={[styles.welcomeText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                {selectedPet.name} hakkında her şeyi sorabilirsin. Beslenme, sağlık, bakım ve daha fazlası!
              </Text>

              {/* Hızlı Sorular */}
              <View style={styles.quickSection}>
                <Text style={[styles.quickLabel, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
                  Hızlı sorular:
                </Text>
                {quickQuestions.map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => handleSend(q)}
                    style={[styles.quickBtn, { backgroundColor: `${petColor}10`, borderColor: petColor }]}
                  >
                    <Text style={[styles.quickText, { color: petColor, fontFamily: 'Nunito_700Bold' }]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} petColor={petColor} />
          ))}

          {isTyping && <TypingIndicator petColor={petColor} />}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceAlt,
                color: theme.textPrimary,
                borderColor: theme.border,
                fontFamily: 'Nunito_400Regular',
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`${selectedPet.name} hakkında sor...`}
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim() && !isTyping ? petColor : theme.border,
              },
            ]}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* Veteriner Uyarısı */}
        <View style={[styles.disclaimer, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.disclaimerText, { color: theme.textMuted, fontFamily: 'Nunito_400Regular' }]}>
            ⚠️ PawBot veteriner değildir. Ciddi durumlarda mutlaka veterinere başvurun.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg, padding: SPACING.xl },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16 },
  headerSub: { fontSize: 11 },
  clearBtn: { fontSize: 18, padding: 4 },
  messageArea: { flex: 1 },
  messageContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  welcomeSection: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  welcomeTitle: { fontSize: 20 },
  welcomeText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  quickSection: { width: '100%', gap: SPACING.sm, marginTop: SPACING.md },
  quickLabel: { fontSize: 12, marginLeft: 4 },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  quickText: { fontSize: 13 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  disclaimer: { paddingHorizontal: SPACING.lg, paddingVertical: 6 },
  disclaimerText: { fontSize: 10, textAlign: 'center' },
});
