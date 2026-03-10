// components/chat/MessageBubble.tsx — Mesaj Baloncuğu
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING } from '../../constants/fonts';
import { ChatMessage } from '../../types';

interface Props {
  message: ChatMessage;
  petColor: string;
}

export function MessageBubble({ message, petColor }: Props) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: `${petColor}20` }]}>
          <Text style={{ fontSize: 14 }}>🐾</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: petColor, borderBottomRightRadius: 4 }
            : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 4 },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isUser ? '#FFFFFF' : theme.textPrimary,
              fontFamily: 'Nunito_400Regular',
            },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.time,
            { color: isUser ? 'rgba(255,255,255,0.6)' : theme.textMuted },
          ]}
        >
          {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: SPACING.sm,
    maxWidth: '85%',
  },
  rowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  text: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end', fontFamily: 'Nunito_700Bold' },
});
