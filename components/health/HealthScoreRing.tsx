// components/health/HealthScoreRing.tsx — Sağlık Skoru Halkası
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  score: number;
  size?: number;
  color?: string;
}

export function HealthScoreRing({ score, size = 100, color }: Props) {
  const { shared, theme } = useTheme();
  const ringColor = color || shared.secondary;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreLabel = () => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Dikkat';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.border}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.center}>
          <Text style={[styles.score, { color: ringColor, fontFamily: 'Syne_700Bold' }]}>
            {score}
          </Text>
          <Text style={[styles.label, { color: theme.textMuted, fontFamily: 'Nunito_700Bold' }]}>
            {getScoreLabel()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 24 },
  label: { fontSize: 10, marginTop: 2 },
});
