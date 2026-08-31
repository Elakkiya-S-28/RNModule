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
  rating: number;
  reviewsCount: number;
  hospital: string;
  city: string;
  consultationFee: number;
  bio: string;
  languages: string[];
  availableModes: ConsultationMode[];
  avatarUrl: string | null;

  availability: Record<string, number[]>;
}

export interface Slot {
  id: string;
  doctorId: string;
  dateISO: string;
  startMinutes: number;
  mode: ConsultationMode;
  isBooked: boolean;

  bookedAt: number | null;
  patientId?: string | null;

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

  cancelledAt: number | null;

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
