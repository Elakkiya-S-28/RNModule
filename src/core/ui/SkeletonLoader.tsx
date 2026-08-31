import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SkeletonBox, SkeletonGroup, SkeletonText, SkeletonPlaceholder } from './SkeletonPrimitives';
import { ProductGridSkeleton, productCardSkeleton } from './skeletons/product_grid_skeleton';
import { ListRowSkeleton, healthCardSkeleton, healthRowSkeleton } from './skeletons/list_row_skeleton';
import { DoctorHeroSkeleton } from './skeletons/doctor_hero_skeleton';
import { SlotGridSkeleton, DateStripSkeleton } from './skeletons/slot_grid_skeleton';

interface SkeletonLoaderProps {
  isLoading?: boolean;
  children?: React.ReactNode;
  layout?: unknown;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({ children, style }: SkeletonLoaderProps) {
  return <SkeletonPlaceholder style={style}>{children}</SkeletonPlaceholder>;
}

export function listRowSkeleton(count = 6) {
  return <ListRowSkeleton count={count} />;
}

export function sectionSkeleton(count = 3) {
  return <SlotGridSkeleton count={count * 3} />;
}

export const rowSkeletonLayout = listRowSkeleton;
export const cardSkeletonLayout = sectionSkeleton;

export {
  SkeletonBox,
  SkeletonGroup,
  SkeletonText,
  SkeletonPlaceholder,
  ProductGridSkeleton,
  productCardSkeleton,
  ListRowSkeleton,
  healthCardSkeleton,
  healthRowSkeleton,
  DoctorHeroSkeleton,
  SlotGridSkeleton,
  DateStripSkeleton,
};

export default SkeletonLoader;
