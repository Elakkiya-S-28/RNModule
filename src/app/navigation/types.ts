import { Doctor } from '../../modules/consultations/src/types/ct';

export type RootStackParamList = {
  MainTabs: undefined;
};
export type ConsultationsStackParamList = {
  DoctorList: undefined;
  DoctorDetails: { doctorId?: string; doctor?: Doctor };
  Upcoming: undefined;
};
export type ShopStackParamList = {
  ProductList: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Wishlist: undefined;
};
export type HealthStackParamList = {
  HealthTimeline: undefined;
  RecordDetail: { recordId: string };
};
export type MainTabParamList = {
  Consultations: undefined;
  Shop: undefined;
  Health: undefined;
};
export function isDoctor(value: unknown): value is Doctor {
  return typeof value === 'object' && value !== null && 'id' in value;
}