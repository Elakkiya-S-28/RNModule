import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../theme/themeStore';
import { SkeletonBox, SkeletonGroup, SkeletonText } from '../SkeletonPrimitives';

const CARD_R = 16;
const PAD = 10;

interface RowsProps {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProductGridSkeleton({ count = 4, style }: RowsProps) {
  const c = useThemeStore(s => s.theme.colors);
  const bone = { backgroundColor: c.bone };
  return (
    <View style={[styles.grid, style]}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonGroup key={i} style={styles.cell}>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.media, { backgroundColor: c.surfaceAlt }]}>
              <SkeletonBox w={44} h={44} r={12} style={bone} />
              <View style={styles.badgeStub}>
                <SkeletonBox w={28} h={12} r={4} style={bone} />
              </View>
              <View style={styles.heartStub}>
                <SkeletonBox w={14} h={14} r={7} style={bone} />
              </View>
            </View>
            <SkeletonText widths={['88%', '58%']} h={12} r={5} gap={5} />
            <SkeletonBox w="52%" h={10} r={4} mt={7} style={bone} />
            <View style={styles.priceRow}>
              <SkeletonBox w={52} h={15} r={5} style={bone} />
              <SkeletonBox w={34} h={11} r={4} style={bone} />
            </View>
            <View style={[styles.priceRow, styles.footerRow]}>
              <SkeletonBox w={38} h={11} r={4} style={bone} />
              <SkeletonBox w={52} h={16} r={8} style={bone} />
            </View>
          </View>
        </SkeletonGroup>
      ))}
    </View>
  );
}

export function productCardSkeleton(count = 4) {
  return <ProductGridSkeleton count={count} />;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    padding: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: CARD_R,
    padding: PAD,
  },
  media: {
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeStub: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  heartStub: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  footerRow: {
    justifyContent: 'space-between',
  },
});

