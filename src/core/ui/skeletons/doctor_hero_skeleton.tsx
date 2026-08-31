import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../theme/themeStore';
import { SkeletonBox, SkeletonGroup } from '../SkeletonPrimitives';

export function DoctorHeroSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useThemeStore(s => s.theme.colors);
  const bone = { backgroundColor: c.bone };
  return (
    <SkeletonGroup style={[styles.hero, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      <SkeletonBox w={72} h={72} r={36} style={bone} />
      <View style={styles.body}>
        <SkeletonBox w="58%" h={17} r={6} style={bone} />
        <SkeletonBox w="42%" h={13} r={5} mt={6} style={bone} />
        <SkeletonBox w="66%" h={12} r={4} mt={5} style={bone} />
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 14 },
  body: { flex: 1, marginLeft: 14 },
});
