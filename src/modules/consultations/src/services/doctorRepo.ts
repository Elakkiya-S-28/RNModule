import {
  Doctor,
  DoctorFilters,
  DoctorListResult,
  Slot,
  Specialization,
  ConsultationMode,
} from '../types/ct';
import {
  HOSPITALS,
  CITIES,
  SEEDS,
  mulberry32,
  seededRandom,
} from '../../../../core/db/mock/names';

export const DOCTOR_COUNT = 5000;

const SPECIALIZATIONS: Specialization[] = [
  'General Physician', 'Cardiology', 'Pulmonology', 'Neurology', 'Dermatology',
  'Pediatrics', 'Orthopedics', 'Gastroenterology', 'Gynecology', 'ENT',
  'Ayurveda', 'Psychiatry',
];
const MODES: ConsultationMode[] = ['video', 'audio', 'chat', 'in-person'];
const INDIAN_NAMES = [
  'Aarav Sharma', 'Vihaan Iyer', 'Arjun Patel', 'Rohan Reddy', 'Kunal Gupta',
  'Aditya Nair', 'Rahul Desai', 'Ananya Kumar', 'Priya Verma', 'Sneha Joshi',
  'Kavya Rao', 'Meera Menon', 'Diya Singh', 'Riya Chopra', 'Shreya Bose',
  'Maya Agarwal', 'Nikhil Singh', 'Ishaan Gupta', 'Tanvi Rao', 'Divya Nair',
];
const BIO =
  'Specialist with a patient-first approach and extensive clinical experience in diagnostic and therapeutic medicine.';

const doctorCache = new Map<number, Doctor>();

export function getDoctorByRank(rank: number): Doctor {
  const cached = doctorCache.get(rank);
  if (cached) return cached;
  const rng = mulberry32(SEEDS.doctors + rank);
  const name = `${INDIAN_NAMES[Math.floor(rng() * INDIAN_NAMES.length)]}${rank % 57}`;
  const spec = SPECIALIZATIONS[Math.floor(rng() * SPECIALIZATIONS.length)];

  const availability: Record<string, number[]> = {};
  const today = new Date();
  for (let d = 0; d < 14; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
    const iso = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const slots: number[] = [];
    const startHour = 9 + Math.floor(rng() * 8);
    const n = 3 + Math.floor(rng() * 4);
    for (let s = 0; s < n; s++) {
      slots.push((startHour + s * 2) * 60 + (rng() < 0.4 ? 0 : 30));
    }
    availability[iso] = slots;
  }

  const doctor: Doctor = {
    id: `doc-${rank + 1}`,
    name,
    specialization: spec,
    experienceYears: 3 + Math.floor(rng() * 25),
    rating: Math.round((3.5 + rng() * 1.4) * 10) / 10,
    reviewsCount: Math.floor(rng() * 800),
    hospital: HOSPITALS[Math.floor(rng() * HOSPITALS.length)],
    city: CITIES[Math.floor(rng() * CITIES.length)],
    consultationFee: 400 + Math.floor(rng() * 40) * 25,
    bio: `${BIO} Specialises in ${spec}.`,
    languages: rng() < 0.5 ? ['English', 'Hindi'] : ['English', 'Hindi', 'Telugu'],
    availableModes: MODES.filter(() => rng() < 0.6),
    avatarUrl: null,
    availability,
  };
  doctorCache.set(rank, doctor);
  return doctor;
}

const slotCache = new Map<string, Slot>();

export function getSlot(
  doctor: Doctor,
  dateISO: string,
  startMinutes: number,
  mode: ConsultationMode,
): Slot {
  const key = `${doctor.id}|${dateISO}|${startMinutes}|${mode}`;
  const cached = slotCache.get(key);
  if (cached) return cached;
  const booked = seededRandom(key) < 0.35;
  const slot: Slot = {
    id: `slot-${hashKey(key)}`,
    doctorId: doctor.id,
    dateISO,
    startMinutes,
    mode,
    isBooked: booked,
    bookedAt: booked ? Date.now() - Math.floor(seededRandom(key + 't') * 86400000) : null,
    patientId: booked ? `pat-${Math.floor(seededRandom(key + 'p') * 9000)}` : null,
    clinic: doctor.hospital,
  };
  slotCache.set(key, slot);
  return slot;
}

function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function getDoctorSlots(
  doctor: Doctor,
  dateISO: string,
  mode?: ConsultationMode,
  includeBooked = false,
): Slot[] {
  const minutes = doctor.availability[dateISO] ?? [];
  const modes = mode ? [mode] : doctor.availableModes.length ? doctor.availableModes : MODES;
  const now = Date.now();
  const dateStart = new Date(dateISO + 'T00:00:00').getTime();
  const slots: Slot[] = [];
  for (const m of minutes) {
    const slotTs = dateStart + m * 60000;
    if (slotTs <= now) continue;
    for (const md of modes) {
      const slot = getSlot(doctor, dateISO, m, md);
      if (!includeBooked && slot.isBooked) continue;
      slots.push(slot);
    }
  }
  slots.sort((a, b) => a.startMinutes - b.startMinutes);
  return slots;
}

export function getDoctorsPage(
  page: number,
  pageSize: number,
  filters: DoctorFilters = {},
  sortBy?: 'rating' | 'fee' | 'experience',
): DoctorListResult {
  const total = DOCTOR_COUNT;
  const start = (page - 1) * pageSize;
  const matching: Doctor[] = [];
  for (let i = 0; i < total; i++) {
    const d = getDoctorByRank(i);
    if (matchesDoctor(d, filters)) matching.push(d);
  }
  matching.sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    return b.reviewsCount - a.reviewsCount;
  });
  const items = matching.slice(start, start + pageSize);
  return { items, total: matching.length, page, pageSize };
}

export function matchesDoctor(d: Doctor, f: DoctorFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase().trim();
    if (
      !d.name.toLowerCase().includes(q) &&
      !d.specialization.toLowerCase().includes(q) &&
      !d.city.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  if (f.specializations?.length && !f.specializations.includes(d.specialization)) return false;
  if (f.maxFee != null && d.consultationFee > f.maxFee) return false;
  if (f.minRating != null && d.rating < f.minRating) return false;
  if (f.mode && !d.availableModes.includes(f.mode)) return false;
  if (f.city && d.city !== f.city) return false;
  return true;
}
