import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { toast } from '../../../../core/toast';
import { formatTime12h, relativeTime } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { consultationService } from '../services/consultationApi';
import { useAppointmentsStore, selectUpcoming } from '../store/appointmentsStore';
import { getDoctorByRank } from '../services/doctorRepo';
import { Booking } from '../types/ct';

interface Props {
  onBack: () => void;
}

export function UpcomingConsultations({ onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const bookings = useAppointmentsStore(s => s.bookings);
  const refreshExpiry = useAppointmentsStore(s => s.refreshExpiry);

  useEffect(() => {
    refreshExpiry();
    const id = setInterval(() => refreshExpiry(), 60000);
    return () => clearInterval(id);
  }, [refreshExpiry]);

  const upcoming = useMemo(() => {
    const list = selectUpcoming(bookings);
    return [...list].sort((a, b) => {
      const ta = new Date(`${a.dateISO}T00:00:00`).getTime() + a.startMinutes * 60000;
      const tb = new Date(`${b.dateISO}T00:00:00`).getTime() + b.startMinutes * 60000;
      return ta - tb;
    });
  }, [bookings]);

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard
        booking={item}
        onCancel={() => {
          consultationService.cancelBooking(item.id);
          useAppointmentsStore.getState().cancelBooking(item.id);
          toast.info('Booking cancelled.');
        }}
      />
    ),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar
        title="Upcoming consultations"
        subtitle={`${upcoming.length} scheduled`}
        onBack={onBack}
      />
      <FlatList
        data={upcoming}
        keyExtractor={b => b.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No upcoming consultations"
            message="Book a slot from the doctor explorer and it will appear here."
          />
        }
      />
    </View>
  );
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const doctor = getDoctorByRank(rankFromId(booking.doctorId));
  const slotStart = new Date(`${booking.dateISO}T00:00:00`).getTime() + booking.startMinutes * 60000;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]}>{doctor.name}</Text>
          <Text style={[styles.spec, { color: c.primary }]}>{doctor.specialization}</Text>
        </View>
        <Badge label={booking.mode} tone="info" small />
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {new Date(`${booking.dateISO}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
          {' · '}
          {formatTime12h(Math.floor(booking.startMinutes / 60), booking.startMinutes % 60)}
        </Text>
        <Text style={[styles.countdown, { color: c.accent }]}>
          {relativeTime(slotStart)}
        </Text>
      </View>
      {booking.reason ? (
        <Text style={[styles.reason, { color: c.textMuted }]}>{booking.reason}</Text>
      ) : null}
      <View style={styles.actions}>
        <Button label="Cancel booking" variant="danger" onPress={onCancel} />
      </View>
    </View>
  );
}

function rankFromId(id: string): number {
  const m = /^doc-(\d+)$/.exec(id);
  return m ? Number(m[1]) - 1 : 0;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  name: { ...fontType.cardTitle, fontSize: 16 },
  spec: { ...fontType.caption, fontWeight: '600', marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meta: { ...fontType.caption },
  countdown: { ...fontType.label },
  reason: { ...fontType.caption, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default UpcomingConsultations;
