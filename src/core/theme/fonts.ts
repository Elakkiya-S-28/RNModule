export const Fonts = {
  serif: 'Fraunces',
  sans: 'Manrope',
} as const;

export type FontFamily = (typeof Fonts)[keyof typeof Fonts];

type Weight = 400 | 500 | 600 | 700 | 800;

type Family = 'serif' | 'sans';

export function font(family: Family, weight: Weight = 400): string {
  if (family === 'serif') {
    if (weight <= 400) return 'Fraunces';
    if (weight <= 500) return 'Fraunces Medium';
    if (weight <= 600) return 'Fraunces SemiBold';
    return 'Fraunces Bold';
  }
  if (weight <= 400) return 'Manrope';
  if (weight <= 500) return 'Manrope Medium';
  if (weight <= 600) return 'Manrope SemiBold';
  if (weight <= 700) return 'Manrope Bold';
  return 'Manrope ExtraBold';
}

export const type = {
  appTitle: {
    fontFamily: font('serif', 600),
    fontSize: 21,
    letterSpacing: 0.2,
  },
  screenTitle: {
    fontFamily: font('serif', 600),
    fontSize: 24,
  },
  sectionTitle: {
    fontFamily: font('serif', 600),
    fontSize: 18,
  },
  cardTitle: {
    fontFamily: font('serif', 500),
    fontSize: 15,
  },
  body: {
    fontFamily: font('sans', 400),
    fontSize: 15,
  },
  bodyMedium: {
    fontFamily: font('sans', 500),
    fontSize: 15,
  },
  label: {
    fontFamily: font('sans', 600),
    fontSize: 13,
  },
  caption: {
    fontFamily: font('sans', 400),
    fontSize: 12,
  },
  button: {
    fontFamily: font('sans', 600),
    fontSize: 15,
  },
  price: {
    fontFamily: font('serif', 600),
    fontSize: 16,
  },
  stat: {
    fontFamily: font('serif', 700),
    fontSize: 15,
  },
} as const;

export type TextStyleToken = keyof typeof type;

export default Fonts;
