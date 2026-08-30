import { api, flushOfflineQueue } from '../../../../core/api';
import { mockTransport } from '../../../../core/db/mockServer';
import {
  Booking,
  Doctor,
  DoctorFilters,
  DoctorListResult,
  Slot,
} from '../types/ct';
import { logger } from '../../../../core/logger';
import { toast } from '../../../../core/toast';

// Route the shared API client through the mock transport. The transport is
// also wired centrally in AppProviders/bootstrap for import-order safety.
api.useTransport(mockTransport);

const PATIENT_NAME = 'Patient Sharma';

async function listDoctors(filters: DoctorFilters, page: number, pageSize: number, sortBy?: string): Promise<DoctorListResult> {
  const base = `doctors?page=${page}&pageSize=${pageSize}`;
  const qs = new URLSearchParams();
  if (filters.query) qs.set('query', filters.query);
  if (filters.specializations?.length) qs.set('specializations', JSON.stringify(filters.specializations));
  if (filters.maxFee != null) qs.set('maxFee', String(filters.maxFee));
  if (filters.minRating != null) qs.set('minRating', String(filters.minRating));
  if (filters.mode) qs.set('mode', filters.mode);
  if (filters.city) qs.set('city', filters.city);
  if (sortBy) qs.set('sortBy', sortBy);
  const q = qs.toString();
  const url = q ? `${base}&${q}` : base;
  const cacheKey = `doctors:${url}`;
  return api.get<DoctorListResult>(url, {
    cacheKey,
    cacheTtlMs: 3 * 60 * 1000,
  });
}

async function getDoctorDetails(doctorId: string, dateISO: string): Promise<{ doctor: Doctor; slots: Slot[] }> {
  const url = `doctors/${doctorId}?date=${dateISO}`;
  return api.get<{ doctor: Doctor; slots: Slot[] }>(url, {
    cacheKey: `doctor:${doctorId}:${dateISO}`,
    cacheTtlMs: 60 * 1000,
  });
}

/**
 * Book a slot. Returns the created booking. When offline, the request is
 * queued by the ApiClient and we optimistically create the booking locally.
 */
async function bookSlot(doctor: Doctor, slot: Slot, reason?: string): Promise<Booking> {
  try {
    await api.post(`doctors/${doctor.id}/book`, {
      slotId: slot.id,
      patientName: PATIENT_NAME,
      reason,
      dateISO: slot.dateISO,
      startMinutes: slot.startMinutes,
      mode: slot.mode,
    }, { timeout: 5000, retries: 1 });
  } catch (err) {
    logger.warn(`Book request queued/relaxed: ${JSON.stringify(err)}`);
  }
  const booking: Booking = {
    id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    doctorId: doctor.id,
    slotId: slot.id,
    dateISO: slot.dateISO,
    startMinutes: slot.startMinutes,
    mode: slot.mode,
    patientName: PATIENT_NAME,
    patientAge: 32,
    reason,
    status: 'upcoming',
    createdAt: Date.now(),
    cancelledAt: null,
    isExpired: false,
  };
  return booking;
}

async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await api.delete(`bookings/${bookingId}`, { timeout: 5000, retries: 1 });
  } catch (err) {
    logger.warn(`Cancel request queued/relaxed: ${JSON.stringify(err)}`);
  }
}

async function syncOffline(): Promise<{ flushed: number; remaining: number }> {
  return flushOfflineQueue(mockTransport);
}

export const consultationService = {
  listDoctors,
  getDoctorDetails,
  bookSlot,
  cancelBooking,
  syncOffline,
};

export function notifySync(): void {
  syncOffline()
    .then(({ flushed, remaining }) => {
      if (flushed > 0) toast.success(`Synced ${flushed} offline ${flushed === 1 ? 'item' : 'items'}`);
      else if (remaining > 0) toast.warning(`Still ${remaining} to sync`);
    })
    .catch(() => toast.error('Could not sync. Will retry.'));
}