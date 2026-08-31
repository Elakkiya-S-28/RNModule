import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Doctor } from '../types/ct';
import { Avatar } from '../../../../core/ui/Avatar';
import { Badge } from '../../../../core/ui/Badge';
import { formatCurrency } from '../../../../core/util/format';
import { FadeInView, staggerDelay } from '../../../../core/util/motion';
import { AppIcon } from '../../../../core/ui/AppIcon';
interface Props {
  doctor: Doctor;
  onPress?: () => void;
  entranceDelay?: number;
}
export const DoctorCard = React.memo(function DoctorCard({ doctor, onPress, entranceDelay = 0 }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const surfaceStyle =
    theme.mode === 'dark'
      ? { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
      : { backgroundColor: c.surface, ...theme.shadow.card, shadowColor: c.shadowPrimary };

  return (
    <FadeInView delay={entranceDelay}>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={doctor.name}
      style={({ pressed }) => [
        styles.card,
        surfaceStyle,
        { opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <Avatar name={doctor.name} uri={doctor.avatarUrl} size={52} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.name, { color: c.text }]}>
          {doctor.name}
        </Text>
        <Text numberOfLines={1} style={[styles.spec, { color: c.primary }]}>
          {doctor.specialization} · {doctor.experienceYears} yrs
        </Text>
        <Text numberOfLines={1} style={[styles.meta, { color: c.textSecondary }]}>
          {doctor.hospital} · {doctor.city}
        </Text>
        <View style={styles.row}>
          <View style={styles.ratingWrap}>
            <AppIcon name="star" size={12} color="warning" />
            <Text style={{ color: c.warning, fontWeight: '700', fontSize: 13 }}>
              {doctor.rating.toFixed(1)}
            </Text>
          </View>
          <Badge label={formatCurrency(doctor.consultationFee)} tone="primary" small />
          <Text style={[styles.reviews, { color: c.textMuted }]}>({doctor.reviewsCount})</Text>
        </View>
      </View>
      <AppIcon name="chevronForward" size={16} color="textMuted" style={{ marginLeft: 4 }} />
    </Pressable>
    </FadeInView>
  );
});
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  body: { flex: 1, marginLeft: 12, marginRight: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  spec: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  meta: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviews: { fontSize: 12 },
});
export default DoctorCard;