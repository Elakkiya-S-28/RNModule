import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../../../../core/theme/themeStore';
import { AppBar } from '../../../../core/ui/AppBar';
import { Avatar } from '../../../../core/ui/Avatar';
import { Badge } from '../../../../core/ui/Badge';
import { Button } from '../../../../core/ui/Button';
import { SkeletonLoader, rowSkeletonLayout, SlotGridSkeleton } from '../../../../core/ui/SkeletonLoader';
import { toast } from '../../../../core/toast';
import { formatCurrency, formatTime12h, toISODate } from '../../../../core/util/format';
import { type as fontType } from '../../../../core/theme/fonts';
import { consultationService } from '../services/consultationApi';
import { useAppointmentsStore, isSlotBookedById } from '../store/appointmentsStore';
import { Doctor, Slot } from '../types/ct';
import { SlotGrid, DateStrip, buildDates } from '../component/SlotPicker';
import { AppIcon } from '../../../../core/ui/AppIcon';

interface Props {
  doctorId: string;
  onBack: () => void;
  onBooked: () => void;
}

export function DoctorDetailsScreen({ doctorId, onBack, onBooked }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const bookings = useAppointmentsStore(s => s.bookings);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(toISODate(Date.now()));
  const [booking, setBooking] = useState<Slot | null>(null);
  const [confirming, setConfirming] = useState(false);
  const dates = buildDates(14);

  useEffect(() => {
    let active = true;
    setDoctorLoading(true);
    consultationService
      .getDoctor(doctorId)
      .then(d => {
        if (!active) return;
        setDoctor(d);
        setDoctorLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setDoctorLoading(false);
        toast.error('Could not load doctor');
      });
    return () => {
      active = false;
    };
  }, [doctorId]);

  useEffect(() => {
    let active = true;
    setSlotsLoading(true);
    setBooking(null);
    consultationService
      .getDoctorDetails(doctorId, selectedDate)
      .then(res => {
        if (!active) return;
        setSlots(res.slots);
        setSlotsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSlotsLoading(false);
        toast.error('Could not load slots');
      });
    return () => {
      active = false;
    };
  }, [doctorId, selectedDate]);

  const markBooked = useCallback(
    (slot: Slot) => slot.isBooked || isSlotBookedById(bookings, slot.id) || slotExpired(slot),
    [bookings],
  );

  function onSelectSlot(slot: Slot) {
    setBooking(cur => (cur?.id === slot.id ? null : slot));
  }

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
    setConfirming(true);
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
      setConfirming(false);
    }
  }

  if (doctorLoading) {
    return (
      <SkeletonLoader>
        {rowSkeletonLayout(5)}
      </SkeletonLoader>
    );
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
          <Stat
            label="Rating"
            value={doctor.rating.toFixed(1)}
            icon={<AppIcon name="star" size={12} color="warning" />}
          />
          <Stat label="Reviews" value={`${doctor.reviewsCount}`} />
          <Stat label="Fee" value={formatCurrency(doctor.consultationFee)} />
        </View>        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Available slots</Text>
          <DateStrip dates={dates} selected={selectedDate} onSelect={setSelectedDate} />
          {slotsLoading ? (
            <SlotGridSkeleton count={9} />
          ) : (
            <SlotGrid
              slots={slots}
              selectedId={booking?.id ?? null}
              unavailable={markBooked}
              onSelect={onSelectSlot}
            />
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
          <ConfirmBar
            doctor={doctor}
            slot={booking}
            confirming={confirming}
            onConfirm={confirmBooking}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function slotExpired(slot: Slot): boolean {
  const start =
    new Date(`${slot.dateISO}T00:00:00`).getTime() + slot.startMinutes * 60000;
  return start <= Date.now();
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.statValueWrap}>
        {icon}
        <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      </View>
      <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
    </View>
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
      <Button
        label={confirming ? 'Booking...' : 'Book consultation'}
        onPress={onConfirm}
        loading={confirming}
        disabled={confirming}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heroBody: { flex: 1, marginLeft: 14 },
  hname: { fontSize: 18, fontWeight: '700' },
  hspec: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  hmeta: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  statValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  confirm: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmInfo: { flex: 1, marginRight: 12 },
});

export default DoctorDetailsScreen;
