import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { Badge } from '../../../../core/ui/Badge';
import { Avatar } from '../../../../core/ui/Avatar';
import { FadeInView } from '../../../../core/util/motion';
import { healthService } from '../services/healthApi';
import { HealthRecord } from '../types/health';
import { AppIcon } from '../../../../core/ui/AppIcon';

interface Props {
  record: HealthRecord;
  onPress?: () => void;
  entranceDelay?: number;
}

export function HealthRecordRow({ record, onPress, entranceDelay = 0 }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const surfaceStyle =
    theme.mode === 'dark'
      ? { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
      : { backgroundColor: c.surface, ...theme.shadow.card, shadowColor: c.shadowPrimary };
  const d = new Date(record.dateTs);
  const tone =
    record.status === 'critical'
      ? 'danger'
      : record.status === 'attention'
      ? 'warning'
      : 'success';
  return (
    <FadeInView delay={entranceDelay}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={record.title}
        style={({ pressed }) => [
          styles.row,
          surfaceStyle,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <Avatar name={record.title} size={40} />
        <View style={styles.body}>
          <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
            {record.title}
          </Text>
          <Text numberOfLines={1} style={[styles.meta, { color: c.textSecondary }]}>
            {healthService.KIND_LABELS[record.kind]} - {record.provider}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.date, { color: c.textMuted }]}>
              {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} -{' '}
              {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
            <Badge label={record.status} tone={tone} small />
          </View>
          {record.attachments.length > 0 ? (
            <View style={styles.attachmentsRow}>
              <AppIcon name="attach" size={11} color="primary" />
              <Text style={[styles.attachments, { color: c.primary }]}>
                {record.attachments.length} attachment
                {record.attachments.length > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  body: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter SemiBold' },
  meta: { fontSize: 12, marginTop: 2, fontFamily: 'Inter' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  date: { fontSize: 11, fontFamily: 'Inter' },
  attachments: { fontSize: 11, fontFamily: 'Inter Medium' },
  attachmentsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
});

export default HealthRecordRow;