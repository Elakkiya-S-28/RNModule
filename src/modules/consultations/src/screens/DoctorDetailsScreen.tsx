import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Avatar } from '../../../../core/ui/Avatar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { Spinner } from '../../../../core/ui/Spinner';
import { toast } from '../../../../core/toast';
import { formatCurrency, formatTime12h, toISODate } from '../../../../core/util/format';
import { consultationService } from '../services/consultationApi';
import { useAppointmentsStore, isSlotBookedById } from '../store/appointmentsStore';
import { Doctor, Slot } from '../types/ct';

interface Props {
  doctorId: string;
  onBack: () => void;
  onBooked: () => void;
}

export function DoctorDetailsScreen({ doctorId, onBack, onBooked }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const bookings = useAppointmentsStore(s => s.bookings);

  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(toISODate(Date.now()));
  const [booking, setBooking] = useState<Slot | null>(null);
  const [bookingConfirming, setBookingConfirming] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    consultationService
      .getDoctorDetails(doctorId, selectedDate)
      .then(res => {
        if (!active) return;
        setDoctor(res.doctor);
        setSlots(res.slots);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        toast.error('Could not load doctor details');
      });
    return () => {
      active = false;
    };
  }, [doctorId, selectedDate]);

  const dates = useMemo(() => buildDates(14), []);

  const markBooked = useCallback(
    (slot: Slot) => slot.isBooked || isSlotBookedById(bookings, slot.id) || slotExpired(slot),
    [bookings],
  );

  async function confirmBooking() {
    if (!doctor || !booking) return;
    if (isSlotBookedById(bookings, booking.id)) {
      toast.error('This slot was just booked by someone - pick another.');
      return;
    }
    if (slotExpired(booking)) {
      toast.error('This slot has just passed. Choose a future slot.');
      setBooking(null);
      return;
    }
    setBookingConfirming(true);
    try {
      await consultationService.bookSlot(doctor, booking, 'General consultation');
      useAppointmentsStore.getState().addBooking({
        doctorId: doctor.id,
        slotId: booking.id,
        dateISO: booking.dateISO,
        startMinutes: booking.startMinutes,
        mode: booking.mode,
        patientName: 'Patient Sharma',
        patientAge: 32,
        status: 'upcoming',
        createdAt: Date.now(),
        cancelledAt: null,
        isExpired: false,
        id: 'bk-' + Date.now(),
      });
      toast.success('Consultation booked! Added to your upcoming list.');
      setBooking(null);
      onBooked();
    } catch {
      toast.error('We could not book right now. Saved offline.');
      setBooking(null);
    } finally {
      setBookingConfirming(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading doctor..." />;
  }
  if (!doctor) {
    return (
      <View>
        <AppBar title="Doctor" onBack={onBack} />
        <Text style={{ padding: 24, color: c.textSecondary }}>Doctor not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar title="Doctor details" subtitle={doctor.name} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Avatar name={doctor.name} size={72} />
          <View style={styles.heroBody}>
            <Text style={[styles.hname, { color: c.text }]}>{doctor.name}</Text>
            <Text style={[styles.hspec, { color: c.primary }]}>{doctor.specialization}</Text>
            <Text style={[styles.hmeta, { color: c.textSecondary }]}>
              {doctor.hospital} - {doctor.city}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Experience" value={`${doctor.experienceYears}y`} />
          <Stat label="Rating" value={`★ ${doctor.rating.toFixed(1)}`} />
          <Stat label="Reviews" value={`${doctor.reviewsCount}`} />
          <Stat label="Fee" value={formatCurrency(doctor.consultationFee)} />
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Available slots</Text>
          <DateStrip dates={dates} selected={selectedDate} onSelect={setSelectedDate} />
          {slots.length === 0 ? (
            <Text style={{ color: c.textMuted, paddingVertical: 12 }}>No free slots this day.</Text>
          ) : (
            <View style={styles.slotGrid}>
              {slots.map(slot => {
                const unavailable = markBooked(slot);
                const selected = booking?.id === slot.id;
                return (
                  <Pressable
                    key={slot.id}
                    disabled={unavailable}
                    onPress={() => setBooking(selected ? null : slot)}
                    style={({ pressed }) => [
                      styles.slotChip,
                      {
                        backgroundColor: selected ? c.primary : unavailable ? c.surfaceAlt : c.surface,
                        borderColor: selected ? c.primary : unavailable ? c.border : c.primary,
                        opacity: pressed && !unavailable ? 0.9 : 1,
                      },
                    ]}
                    accessibilityLabel={`Slot ${formatTime12h(Math.floor(slot.startMinutes / 60), slot.startMinutes % 60)}`}
                  >
                    <Text style={{ color: selected ? c.textInverse : unavailable ? c.textMuted : c.primary, fontWeight: '700', fontSize: 13 }}>
                      {formatTime12h(Math.floor(slot.startMinutes / 60), slot.startMinutes % 60)}
                    </Text>
                    <Text style={{ color: selected ? c.textInverse : c.textMuted, fontSize: 10 }}>
                      {slot.mode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
          <Text style={{ color: c.textSecondary, lineHeight: 20 }}>{doctor.bio}</Text>
          <View style={styles.badgeRow}>
            {doctor.languages.map(l => (
              <Badge key={l} label={l} tone="info" small />
            ))}
          </View>
        </View>

        {booking ? (
          <ConfirmBar doctor={doctor} slot={booking} confirming={bookingConfirming} onConfirm={confirmBooking} />
        ) : null}
      </ScrollView>
    </View>
  );
}
function slotExpired(slot: Slot): boolean {
  const start = new Date(`${slot.dateISO}T00:00:00`).getTime() + slot.startMinutes * 60000;
  return start <= Date.now();
}

function buildDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(toISODate(d.getTime()));
  }
  return out;
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

function DateStrip({
  dates,
  selected,
  onSelect,
}: {
  dates: string[];
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip}>
      {dates.map(iso => {
        const d = new Date(`${iso}T00:00:00`);
        const active = iso === selected;
        return (
          <Pressable
            key={iso}
            onPress={() => onSelect(iso)}
            style={[
              styles.datePill,
              { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border },
            ]}
          >
            <Text style={{ color: active ? c.textInverse : c.textMuted, fontSize: 11 }}>
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <Text style={{ color: active ? c.textInverse : c.text, fontSize: 15, fontWeight: '700' }}>
              {d.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ConfirmBar({
  doctor,
  slot,
  confirming,
  onConfirm,
}: {
  doctor: Doctor;
  slot: Slot;
  confirming: boolean;
  onConfirm: () => void;
}) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.confirm, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.confirmInfo}>
        <Text style={{ color: c.textSecondary, fontSize: 12 }}>
          {formatTime12h(Math.floor(slot.startMinutes / 60), slot.startMinutes % 60)} - {slot.mode}
        </Text>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>
          {formatCurrency(doctor.consultationFee)}
        </Text>
      </View>
      <Button label={confirming ? 'Booking...' : 'Book consultation'} onPress={onConfirm} loading={confirming} disabled={confirming} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  heroBody: { flex: 1, marginLeft: 14 },
  hname: { fontSize: 18, fontWeight: '700' },
  hspec: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  hmeta: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  dateStrip: { marginBottom: 12 },
  datePill: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, alignItems: 'center', minWidth: 58 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 78, alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  confirm: { borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confirmInfo: { flex: 1, marginRight: 12 },
});

export default DoctorDetailsScreen;
