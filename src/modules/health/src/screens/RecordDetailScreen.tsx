import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Badge } from '../../../../core/ui/Badge';
import { Card } from '../../../../core/ui/Card';
import { healthService } from '../services/healthApi';
import { HealthRecord } from '../types/health';

interface Props {
  record: HealthRecord | null;
  onBack: () => void;
}

/** Module 3 — record detail with values and attachment preview thumbnails. */
export function RecordDetailScreen({ record, onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;

  if (!record) {
    return (
      <View>
        <AppBar title="Record" onBack={onBack} />
        <Text style={{ padding: 24, color: c.textSecondary }}>Record not found.</Text>
      </View>
    );
  }

  const d = new Date(record.dateTs);
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Record details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[styles.title, { color: c.text }]}>{record.title}</Text>
          <View style={styles.metaRow}>
            <Badge label={healthService.KIND_LABELS[record.kind]} tone="primary" small />
            <Badge
              label={record.status}
              tone={record.status === 'critical' ? 'danger' : record.status === 'attention' ? 'warning' : 'success'}
              small
            />
          </View>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 8 }}>
            {record.provider} ·{' '}
            {d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <View style={styles.tags}>
            {record.tags.map(t => (
              <Badge key={t} label={`#${t}`} tone="info" small />
            ))}
          </View>
        </Card>

        {record.values && record.values.length > 0 ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Values</Text>
            {record.values.map(v => (
              <View key={v.key} style={styles.valueRow}>
                <Text style={{ color: c.textSecondary, flex: 1 }}>{v.key}</Text>
                <Text style={{ color: c.text, fontWeight: '600' }}>{v.value}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {record.notes ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Notes</Text>
            <Text style={{ color: c.textSecondary, lineHeight: 20 }}>{record.notes}</Text>
          </Card>
        ) : null}

        {record.attachments.length > 0 ? (
          <View>
            <Text style={[styles.sectionTitle, { color: c.text, marginLeft: 4 }]}>Attachments</Text>
            <View style={styles.attachRow}>
              {record.attachments.map(a => (
                <View key={a.id} style={[styles.attach, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Text style={{ fontSize: 30 }}>{a.type === 'image' ? '🖼️' : '📄'}</Text>
                  <Text numberOfLines={1} style={{ color: c.textSecondary, fontSize: 11, marginTop: 4 }}>
                    {a.name}
                  </Text>
                  <Text style={{ color: c.primary, fontSize: 10, marginTop: 2 }}>{a.type.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  valueRow: { flexDirection: 'row', paddingVertical: 6 },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  attach: { borderWidth: 1, borderRadius: 12, padding: 12, width: 100, alignItems: 'center' },
});

export default RecordDetailScreen;