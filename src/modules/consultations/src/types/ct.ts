/** Consultation module domain types. */

export type Specialization =
  | 'General Physician'
  | 'Cardiology'
  | 'Pulmonology'
  | 'Neurology'
  | 'Dermatology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Gastroenterology'
  | 'Gynecology'
  | 'ENT'
  | 'Ayurveda'
  | 'Psychiatry';

export type ConsultationMode = 'video' | 'audio' | 'chat' | 'in-person';

export interface Doctor {
  id: string;
  name: string;
  specialization: Specialization;
  experienceYears: number;
  rating: number; // 0 - 5
  reviewsCount: number;
  hospital: string;
  city: string;
  consultationFee: number;
  bio: string;
  languages: string[];
  availableModes: ConsultationMode[];
  avatarUrl: string | null;
  /** Slots generation source: date-key "yyyy-mm-dd" -> available slot times in minutes. */
  availability: Record<string, number[]>;
}

export interface Slot {
  id: string;
  doctorId: string;
  dateISO: string; // yyyy-mm-dd
  startMinutes: number; // minutes since midnight local (uses 0-1439)
  mode: ConsultationMode;
  isBooked: boolean;
  /** When the booking was placed (epoch ms). Null if free. */
  bookedAt: number | null;
  patientId?: string | null;
  /** In-person slots are local-time bound; used by conflict detection. */
  clinic?: string | null;
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  doctorId: string;
  slotId: string;
  dateISO: string;
  startMinutes: number;
  mode: ConsultationMode;
  patientName: string;
  patientAge: number;
  reason?: string;
  status: BookingStatus;
  createdAt: number;
  /** If cancelled, when. Null otherwise. */
  cancelledAt: number | null;
  /** Whether the slot time has already passed. Derived, but kept for clarity. */
  isExpired: boolean;
}

export interface DoctorFilters {
  query?: string;
  specializations?: Specialization[];
  maxFee?: number | null;
  minRating?: number | null;
  mode?: ConsultationMode | null;
  city?: string | null;
}

export interface DoctorListResult {
  items: Doctor[];
  total: number;
  page: number;
  pageSize: number;
}