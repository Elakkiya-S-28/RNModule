import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../theme/themeStore';
import { SkeletonBox, SkeletonGroup } from '../SkeletonPrimitives';

const CHIP = { w: 90, h: 40, r: 10, gap: 8 };

interface Props {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlotGridSkeleton({ count = 9, style }: Props) {
  const c = useThemeStore(s => s.theme.colors);
  const bone = { backgroundColor: c.bone };
  return (
    <View style={[styles.grid, style]}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonGroup key={i}>
          <SkeletonBox w={CHIP.w} h={CHIP.h} r={CHIP.r} style={bone} />
        </SkeletonGroup>
      ))}
    </View>
  );
}

export function DateStripSkeleton({ count = 7, style }: Props) {
  const c = useThemeStore(s => s.theme.colors);
  const bone = { backgroundColor: c.bone };
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonGroup key={i}>
          <View>
            <SkeletonBox w={40} h={12} r={4} style={bone} />
            <SkeletonBox w={44} h={26} r={8} mt={5} style={bone} />
          </View>
        </SkeletonGroup>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CHIP.gap,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
