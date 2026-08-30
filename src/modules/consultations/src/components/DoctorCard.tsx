import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Doctor } from '../types/ct';
import { Avatar } from '../../../../core/ui/Avatar';
import { Badge } from '../../../../core/ui/Badge';
import { formatCurrency } from '../../../../core/util/format';

interface Props {
  doctor: Doctor;
  onPress?: () => void;
}

/** Virtualised, memoised doctor list row. Memoize via React.memo in the list. */
export const DoctorCard = React.memo(function DoctorCard({ doctor, onPress }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={doctor.name}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
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
          <Text style={{ color: c.warning, fontWeight: '700', fontSize: 13 }}>★ {doctor.rating.toFixed(1)}</Text>
          <Badge label={formatCurrency(doctor.consultationFee)} tone="primary" small />
          <Text style={[styles.reviews, { color: c.textMuted }]}>({doctor.reviewsCount})</Text>
        </View>
      </View>
      <Text style={{ color: c.textMuted, marginLeft: 4 }}>›</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  body: { flex: 1, marginLeft: 12, marginRight: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  spec: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  meta: { fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  reviews: { fontSize: 12 },
});

export default DoctorCard;