/**
 * Localization — Bonus (2 languages: English & Hindi).
 *
 * A lightweight i18n helper that resolves strings from a dictionary keyed by
 * locale. The active locale is stored in the theme/connectivity layer so the
 * UI can re-render on change.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../db/storage';

export type Locale = 'en' | 'hi';

type StringMap = Record<string, string>;
type Dictionary = Record<Locale, StringMap>;

const dict: Dictionary = {
  en: {
    appName: 'Ayurveda Super App',
    doctorList: 'Doctors',
    shop: 'Shop',
    health: 'Health',
    searchDoctors: 'Search doctors, speciality, city…',
    searchProducts: 'Search products…',
    availableSlots: 'Available slots',
    book: 'Book consultation',
    cancelBooking: 'Cancel booking',
    noUpcoming: 'No upcoming consultations',
    addToCart: 'Add to cart',
    yourCart: 'Your cart',
    placeOrder: 'Place order',
    myRecords: 'Health records',
    offline: 'Offline — changes will sync when back online',
    loading: 'Loading…',
    noResults: 'No results found',
    error: 'Something went wrong',
  },
  hi: {
    appName: 'आयुर्वेद सुपर ऐप',
    doctorList: 'डॉक्टर',
    shop: 'शॉप',
    health: 'स्वास्थ्य',
    searchDoctors: 'डॉक्टर, विशेषता, शहर खोजें…',
    searchProducts: 'उत्पाद खोजें…',
    availableSlots: 'उपलब्ध स्लॉट',
    book: 'परामर्श बुक करें',
    cancelBooking: 'बुकिंग रद्द करें',
    noUpcoming: 'कोई आगामी परामर्श नहीं',
    addToCart: 'कार्ट में जोड़ें',
    yourCart: 'आपकी कार्ट',
    placeOrder: 'ऑर्डर करें',
    myRecords: 'स्वास्थ्य रिकॉर्ड',
    offline: 'ऑफ़लाइन — वापस ऑनलाइन आने पर सिंक होंगे',
    loading: 'लोड हो रहा है…',
    noResults: 'कोई परिणाम नहीं मिला',
    error: 'कुछ गलत हो गया',
  },
};

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    set => ({
      locale: 'en',
      setLocale: locale => set({ locale }),
    }),
    { name: 'i18n-locale', storage: createJSONStorage(() => storage as never) },
  ),
);

/** Imperative translate helper usable outside React. */
export function translate(key: string): string {
  const locale = useI18n.getState().locale;
  return dict[locale][key] ?? key;
}

export default useI18n;