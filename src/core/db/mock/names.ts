import { seededRandom } from '../../../core/util/format';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Arjun', 'Rohan', 'Kunal', 'Aditya', 'Rahul', 'Suresh',
  'Ananya', 'Priya', 'Sneha', 'Kavya', 'Diya', 'Meera', 'Riya', 'Shreya',
];
export const LAST_NAMES = [
  'Sharma', 'Iyer', 'Patel', 'Reddy', 'Gupta', 'Nair', 'Desai', 'Kumar',
  'Verma', 'Joshi', 'Rao', 'Menon', 'Singh', 'Chopra', 'Bose', 'Agarwal',
];
export const CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];
export const HOSPITALS = [
  'Amrutam Health Centre', 'Swasthya Care', 'Panchakarma Institute',
  'AyurVeda Wellness', 'Green Leaf Clinic', 'Prakriti Hospital',
  'Jiva Ayurvedic', 'Kaya Kalpa Centre', 'Veda Life Clinic', 'Nadi Health',
];
export const PRODUCT_BRANDS = [
  'Amrutam', 'Himalaya', 'Dabur', 'Patanjali', 'Zandu', 'Baidyanath',
  'Ayurveda House', 'Kottakkal', 'Himalaya Wellness', 'Organic India',
];
export const conductorTokens = {
  FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  HOSPITALS,
  PRODUCT_BRANDS,
};

export const SEEDS = {
  doctors: 20260101,
  products: 20260102,
  records: 20260103,
};

export { seededRandom };
