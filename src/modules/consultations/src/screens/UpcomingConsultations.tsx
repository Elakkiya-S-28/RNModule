import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { EmptyState } from '../../../../core/ui/EmptyState';
import { toast } from '../../../../core/toast';
import { formatTime12h } from '../../../../core/util/format';
import { consultationService } from '../services/consultationApi';
import { useAppointmentsStore } from '../store/appointmentsStore';
import { getDoctorByRank } from '../services/doctorRepo';
import { Booking } from '../types/ct';

interface Props {
  onBack: () => void;
}

/** Module 1 — upcoming consultations list with cancel-booking flow. */
export function UpcomingConsultations({ onBack }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const bookings = useAppointmentsStore(s => s.bookings);
  const upcoming = bookings.filter(b => b.status === 'upcoming');

  // Refresh expiry flags on mount & whenever now ticks.
  useEffect(() => {
    const id = setInterval(() => useAppointmentsStore.getState().refreshExpiry(), 60000);
    return () => clearInterval(id);
  }, []);

  const renderItem = useCallback(({ item }: { item: Booking }) => {
    return <BookingCard booking={item} onCancel={() => handleCancel(item)} />;
  }, []);

  function handleCancel(booking: Booking) {
    consultationService.cancelBooking(booking.id);
    useAppointmentsStore.getState().cancelBooking(booking.id);
    toast.info('Booking cancelled.');
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Upcoming consultations" onBack={onBack} />
      <FlatList
        data={upcoming}
        keyExtractor={b => b.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          upcoming.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No upcoming consultations"
              message="Book a slot from the doctor explorer and it will appear here."
            />
          ) : undefined
        }
      />
    </View>
  );
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const doctor = getDoctorByRank(rankFromId(booking.doctorId));

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]}>{doctor.name}</Text>
          <Text style={[styles.spec, { color: c.primary }]}>{doctor.specialization}</Text>
        </View>
        <Badge label={booking.status} tone={booking.status === 'upcoming' ? 'success' : 'neutral'} small />
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {formatTime12h(Math.floor(booking.startMinutes / 60), booking.startMinutes % 60)} · {booking.mode}
        </Text>
        <Text style={[styles.meta, { color: c.textMuted }]}>
          {new Date(`${booking.dateISO}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Cancel booking"
          variant="danger"
          onPress={onCancel}
        />
      </View>
    </View>
  );
}

function rankFromId(id: string): number {
  const m = /^doc-(\d+)$/.exec(id);
  return m ? Number(m[1]) - 1 : 0;
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700' },
  spec: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  meta: { fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default UpcomingConsultations;