import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface BoxProps {
  w?: number | `${number}%`;
  h: number;
  r?: number;
  mt?: number;
  mb?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({ w = '100%', h, r = 8, mt = 0, mb = 0, style }: BoxProps) {
  const bone = useThemeStore(s => s.theme.colors.bone);
  return (
    <View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          marginTop: mt,
          marginBottom: mb,
          backgroundColor: bone,
        },
        style,
      ]}
    />
  );
}

interface TextProps {
  widths?: (number | `${number}%`)[];
  h?: number;
  r?: number;
  gap?: number;
}

export function SkeletonText({ widths = ['92%', '64%'], h = 14, r = 7, gap = 6 }: TextProps) {
  return (
    <View>
      {widths.map((w, i) => (
        <SkeletonBox key={i} w={w} h={h} r={r} mb={i < widths.length - 1 ? gap : 0} />
      ))}
    </View>
  );
}

interface GroupProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonGroup({ children, style }: GroupProps) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
});

export function SkeletonPlaceholder({ children, style }: GroupProps) {
  return (
    <View style={style}>
      <View style={styles.hidden}>{children}</View>
    </View>
  );
}
