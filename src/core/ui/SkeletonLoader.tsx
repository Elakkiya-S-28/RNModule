import React from 'react';
import Skeleton from 'react-native-reanimated-skeleton';
import { ICustomViewStyle } from 'react-native-reanimated-skeleton/lib/typescript/constants';
import { useThemeStore } from '../theme/themeStore';
import { ViewStyle, StyleProp } from 'react-native';

interface SkeletonLoaderProps {
  isLoading: boolean;
  children?: React.ReactNode;
  layout?: ICustomViewStyle[];
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({ isLoading, children, layout, style }: SkeletonLoaderProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <Skeleton
      isLoading={isLoading}
      boneColor={c.bone}
      highlightColor={c.boneHighlight}
      layout={layout}
      containerStyle={style}
      animationType="pulse"
    >
      {children}
    </Skeleton>
  );
}

export function productCardSkeleton(repeat = 4): ICustomViewStyle[] {
  const acc: ICustomViewStyle[] = [];
  for (let i = 0; i < repeat; i++) {
    acc.push({ width: '46%', height: 80, borderRadius: 12, marginBottom: 12, marginRight: '4%' });
    acc.push({ width: '46%', height: 80, borderRadius: 12, marginBottom: 12, marginRight: '4%' });
    acc.push({ width: '46%', height: 14, borderRadius: 7, marginBottom: 8, marginRight: '4%' });
    acc.push({ width: '46%', height: 14, borderRadius: 7, marginBottom: 16, marginRight: '4%' });
  }
  return acc;
}

export function listRowSkeleton(repeat = 6): ICustomViewStyle[] {
  const acc: ICustomViewStyle[] = [];
  for (let i = 0; i < repeat; i++) {
    acc.push({ width: 46, height: 46, borderRadius: 23, marginRight: 12, marginBottom: 16 });
    acc.push({ width: '64%', height: 14, borderRadius: 7, marginBottom: 6 });
    acc.push({ width: '42%', height: 11, borderRadius: 6, marginBottom: 16 });
  }
  return acc;
}

export function sectionSkeleton(repeat = 3): ICustomViewStyle[] {
  const acc: ICustomViewStyle[] = [];
  for (let i = 0; i < repeat; i++) {
    acc.push({ width: '38%', height: 13, borderRadius: 6, marginBottom: 10 });
    acc.push({ width: '100%', height: 56, borderRadius: 14, marginBottom: 8 });
    acc.push({ width: '100%', height: 56, borderRadius: 14, marginBottom: 8 });
    acc.push({ width: '100%', height: 56, borderRadius: 14, marginBottom: 18 });
  }
  return acc;
}

export const productGridSkeleton = productCardSkeleton;

export const rowSkeletonLayout = listRowSkeleton;

export const cardSkeletonLayout = sectionSkeleton;
