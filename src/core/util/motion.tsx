import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, ViewStyle } from 'react-native';

export const MOTION = {
  fast: 140,
  base: 220,
  slow: 320,
  stagger: 40,
} as const;

const springConfig = {
  friction: 7,
  tension: 220,
  useNativeDriver: true,
};

export function staggerDelay(index: number): number {
  return Math.min(index * MOTION.stagger, MOTION.slow);
}

interface FadeProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeInView({ children, delay = 0, duration = MOTION.base, distance = 8, style }: FadeProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useMemo(
    () =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
      }),
    [anim, distance],
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 0);
    return () => clearTimeout(timer);
  }, [anim, delay, duration]);
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

type ScaleStyle = StyleProp<ViewStyle> | ((pressed: boolean) => StyleProp<ViewStyle>);

interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  style?: ScaleStyle;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityState?: Record<string, unknown>;
  testID?: string;
  children: React.ReactNode;
}

export function PressableScale({
  onPress,
  onLongPress,
  disabled,
  hitSlop,
  style,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  testID,
  children,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = useCallback(
    (to: number) => {
      Animated.spring(scale, { toValue: to, speed: 42, bounciness: 5, useNativeDriver: true }).start();
    },
    [scale],
  );
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPressIn={() => animate(0.965)}
      onPressOut={() => animate(1)}
    >
      {({ pressed }: { pressed: boolean }) => (
        <Animated.View
          style={[
            typeof style === 'function' ? style(pressed) : style,
            { transform: [{ scale }] },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export function usePop(dep: boolean | number | string): Animated.Value {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (dep === false) return;
    anim.setValue(0.88);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.1,
        duration: MOTION.fast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(anim, { toValue: 1, ...springConfig }),
    ]).start();
  }, [dep, anim]);
  return anim;
}

export function useAppear(delay = 0): Animated.Value {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: MOTION.base,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  return anim;
}

export function useToggleScale(dep: boolean): Animated.Value {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!dep) return;
    anim.setValue(0.8);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.18,
        duration: MOTION.fast,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(anim, { toValue: 1, ...springConfig }),
    ]).start();
  }, [dep, anim]);
  return anim;
}

