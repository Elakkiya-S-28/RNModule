import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../theme/themeStore';
import { SkeletonBox, SkeletonGroup } from '../SkeletonPrimitives';

const GEOMETRY = {
  doctor: { avatar: 52, card: { radius: 16, padding: 12, gap: 10 } },
  record: { avatar: 40, card: { radius: 14, padding: 12, gap: 8 } },
} as const;

type Variant = keyof typeof GEOMETRY;

interface Props {
  count?: number;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function ListRowSkeleton({ count = 6, variant = 'doctor', style }: Props) {
  const c = useThemeStore(s => s.theme.colors);
  const g = GEOMETRY[variant];
  const bone = { backgroundColor: c.bone };
  return (
    <View style={style}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonGroup
          key={i}
          style={[
            styles.card,
            {
              borderRadius: g.card.radius,
              padding: g.card.padding,
              marginBottom: g.card.gap,
              backgroundColor: c.surface,
              borderColor: c.border,
            },
          ]}
        >
          <SkeletonBox w={g.avatar} h={g.avatar} r={g.avatar / 2} style={bone} />
          <View style={styles.body}>
            <SkeletonBox w="42%" h={15} r={5} style={bone} />
            <SkeletonBox w="64%" h={12} r={4} mt={5} style={bone} />
            <SkeletonBox w="52%" h={11} r={4} mt={4} style={bone} />
            <View style={styles.row}>
              <SkeletonBox w={44} h={13} r={4} style={bone} />
              <SkeletonBox w={58} h={16} r={8} style={bone} />
              <SkeletonBox w={30} h={11} r={4} style={bone} />
            </View>
          </View>
          <SkeletonBox w={8} h={14} r={4} style={bone} />
        </SkeletonGroup>
      ))}
    </View>
  );
}

export function healthCardSkeleton(count = 6) {
  return <ListRowSkeleton count={count} variant="record" />;
}

export const healthRowSkeleton = healthCardSkeleton;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  body: {
    flex: 1,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
});
