import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Booking } from '../types/ct';
import { storage } from '../../../../core/db/storage';

interface AppointmentsState {
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (bookingId: string) => void;

  refreshExpiry: (now?: number) => void;
}

const jsonStorage = createJSONStorage(() => storage as never);

export const useAppointmentsStore = create<AppointmentsState>()(
  persist(
    set => ({
      bookings: [],
      addBooking: b =>
        set(state => ({ bookings: [b, ...state.bookings] })),
      cancelBooking: bookingId =>
        set(state => ({
          bookings: state.bookings.map(x =>
            x.id === bookingId
              ? { ...x, status: 'cancelled', cancelledAt: Date.now() }
              : x,
          ),
        })),
      refreshExpiry: (now = Date.now()) =>
        set(state => ({
          bookings: state.bookings.map(x => {
            const slotStart = new Date(`${x.dateISO}T00:00:00`).getTime() + x.startMinutes * 60000;
            const expired = slotStart <= now && x.status === 'upcoming';
            const cancelled = x.status !== 'upcoming';
            return {
              ...x,
              isExpired: expired,
              status: expired ? 'completed' : cancelled ? x.status : 'upcoming',
            };
          }),
        })),
    }),
    { name: 'appointments-store', storage: jsonStorage },
  ),
);

export function selectUpcoming(bookings: Booking[], now = Date.now()): Booking[] {
  return bookings.filter(b => {
    if (b.status !== 'upcoming') return false;
    const slotStart = new Date(`${b.dateISO}T00:00:00`).getTime() + b.startMinutes * 60000;
    return slotStart > now;
  });
}

export function isSlotBookedById(bookings: Booking[], slotId: string): boolean {
  return bookings.some(b => b.slotId === slotId && b.status === 'upcoming');
}
