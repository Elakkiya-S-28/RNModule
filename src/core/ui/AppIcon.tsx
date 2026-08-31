import React from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import type { ThemeColors } from '../theme';

/**
 * Semantic icon names used across the app. Keeping the mapping in one place
 * guarantees consistent vector iconography on both iOS and Android.
 */
export type AppIconName =
  /** Doctor / consultations */
  | 'medkit'
  /** Medical alternative */
  | 'medical'
  /** Shopping bag / shop */
  | 'bagHandle'
  /** Health records / documents */
  | 'folderOpen'
  /** Filled heart (wishlist active) */
  | 'heart'
  /** Outlined heart (wishlist inactive) */
  | 'heartOutline'
  /** Star (ratings) */
  | 'star'
  /** Shopping cart */
  | 'cart'
  /** Search */
  | 'search'
  /** Filter / sorting */
  | 'filter'
  /** Calendar (bookings) */
  | 'calendar'
  /** Herbal / natural product placeholder */
  | 'leaf'
  /** Offline connectivity */
  | 'cloudOffline'
  /** Wifi off */
  | 'wifiOff'
  /** Attachment (paperclip) */
  | 'attach'
  /** Image attachment */
  | 'image'
  /** Document attachment */
  | 'document'
  /** Success / check */
  | 'check'
  /** Error / close */
  | 'close'
  /** Information */
  | 'info'
  /** Warning */
  | 'warning'
  /** Chevron pointing back (RTL-aware) */
  | 'chevronBack'
  /** Chevron pointing forward (RTL-aware) */
  | 'chevronForward'
  /** Neutral placeholder for generic empty states */
  | 'albumsOutline'
  /** Increase quantity */
  | 'add'
  /** Decrease quantity */
  | 'remove'
  /** Sort ascending */
  | 'arrowUp'
  /** Sort descending */
  | 'arrowDown'
  /** User / profile */
  | 'person'
  | 'personOutline'
  /** Health / pulse */
  | 'pulse';

type ThemeColorKey = keyof ThemeColors;

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  /** Theme color key (e.g. "primary") or a raw color string. */
  color?: ThemeColorKey | string;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Pure Vector Renderers
// ---------------------------------------------------------------------------

function SearchVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.11);
  const lensSize = size * 0.58;
  const handleLen = size * 0.36;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: lensSize,
          height: lensSize,
          borderRadius: lensSize / 2,
          borderWidth: stroke,
          borderColor: color,
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.12,
        }}
      />
      <View
        style={{
          width: stroke,
          height: handleLen,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          bottom: size * 0.1,
          right: size * 0.22,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function FilterVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.1);
  const knob = stroke * 2.2;
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'space-evenly',
        paddingVertical: size * 0.1,
        paddingHorizontal: size * 0.08,
      }}
    >
      <View
        style={{
          width: '100%',
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: color,
            position: 'absolute',
            left: size * 0.14,
          }}
        />
      </View>
      <View
        style={{
          width: '100%',
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: color,
            position: 'absolute',
            right: size * 0.14,
          }}
        />
      </View>
      <View
        style={{
          width: '100%',
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: color,
            position: 'absolute',
            left: size * 0.38,
          }}
        />
      </View>
    </View>
  );
}

function StarVector({ size, color }: { size: number; color: string }) {
  const s = size * 0.82;
  const rayH = s * 0.52;
  const rayW = s * 0.22;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: rayW,
            height: rayH,
            backgroundColor: color,
            borderRadius: rayW * 0.35,
            transform: [{ rotate: `${angle}deg` }, { translateY: -rayH * 0.28 }],
          }}
        />
      ))}
      <View
        style={{
          width: s * 0.44,
          height: s * 0.44,
          borderRadius: s * 0.22,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function HeartVector({
  size,
  color,
  outline,
}: {
  size: number;
  color: string;
  outline?: boolean;
}) {
  const s = size * 0.52;
  const stroke = Math.max(1.5, size * 0.1);
  return (
    <View style={[styles.center, { width: size, height: size, paddingTop: size * 0.08 }]}>
      <View
        style={{
          width: s * 1.5,
          height: s * 1.5,
          position: 'relative',
          transform: [{ translateY: -size * 0.06 }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: s * 0.12,
            top: 0,
            width: s,
            height: s * 1.45,
            backgroundColor: outline ? 'transparent' : color,
            borderColor: color,
            borderWidth: outline ? stroke : 0,
            borderTopLeftRadius: s / 2,
            borderTopRightRadius: s / 2,
            transform: [{ rotate: '-45deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: s * 0.12,
            top: 0,
            width: s,
            height: s * 1.45,
            backgroundColor: outline ? 'transparent' : color,
            borderColor: color,
            borderWidth: outline ? stroke : 0,
            borderTopLeftRadius: s / 2,
            borderTopRightRadius: s / 2,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}

function CartVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.09);
  const wheelSize = size * 0.16;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.64,
          height: size * 0.42,
          borderColor: color,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderBottomLeftRadius: size * 0.08,
          borderBottomRightRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.28,
          left: size * 0.22,
        }}
      />
      <View
        style={{
          width: stroke,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          top: size * 0.14,
          left: size * 0.12,
          transform: [{ rotate: '-25deg' }],
        }}
      />
      <View
        style={{
          width: size * 0.16,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          top: size * 0.14,
          left: size * 0.04,
        }}
      />
      <View
        style={{
          width: wheelSize,
          height: wheelSize,
          borderRadius: wheelSize / 2,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.12,
          left: size * 0.28,
        }}
      />
      <View
        style={{
          width: wheelSize,
          height: wheelSize,
          borderRadius: wheelSize / 2,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.12,
          right: size * 0.18,
        }}
      />
    </View>
  );
}

function BagVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.09);
  const bagW = size * 0.68;
  const bagH = size * 0.58;
  const handleW = size * 0.36;
  const handleH = size * 0.32;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: handleW,
          height: handleH,
          borderColor: color,
          borderWidth: stroke,
          borderBottomWidth: 0,
          borderTopLeftRadius: handleW / 2,
          borderTopRightRadius: handleW / 2,
          position: 'absolute',
          top: size * 0.12,
        }}
      />
      <View
        style={{
          width: bagW,
          height: bagH,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.1,
          position: 'absolute',
          bottom: size * 0.12,
        }}
      />
    </View>
  );
}

function CalendarVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  const cardW = size * 0.72;
  const cardH = size * 0.68;
  const ringW = stroke * 1.1;
  const ringH = size * 0.2;
  const dot = size * 0.09;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: cardW,
          height: cardH,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.12,
          position: 'absolute',
          bottom: size * 0.12,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: '100%', height: '30%', backgroundColor: color }} />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: size * 0.04,
          }}
        >
          <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
          <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
          <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
          <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
        </View>
      </View>
      <View
        style={{
          width: ringW,
          height: ringH,
          backgroundColor: color,
          borderRadius: ringW / 2,
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.28,
        }}
      />
      <View
        style={{
          width: ringW,
          height: ringH,
          backgroundColor: color,
          borderRadius: ringW / 2,
          position: 'absolute',
          top: size * 0.1,
          right: size * 0.28,
        }}
      />
    </View>
  );
}

function PulseVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.6, size * 0.1);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={{ width: size * 0.85, height: size * 0.5, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '22%',
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '20%',
            top: '15%',
            width: stroke,
            height: '70%',
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '25deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '44%',
            top: 0,
            width: stroke,
            height: '100%',
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-35deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '62%',
            top: '25%',
            width: stroke,
            height: '60%',
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '30deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            width: '25%',
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
      </View>
    </View>
  );
}

function MedkitVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  const kitW = size * 0.72;
  const kitH = size * 0.58;
  const crossLen = size * 0.24;
  const crossThick = stroke * 1.3;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.32,
          height: size * 0.16,
          borderColor: color,
          borderWidth: stroke,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.06,
          borderTopRightRadius: size * 0.06,
          position: 'absolute',
          top: size * 0.12,
        }}
      />
      <View
        style={{
          width: kitW,
          height: kitH,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.12,
          position: 'absolute',
          bottom: size * 0.14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: crossLen,
            height: crossThick,
            backgroundColor: color,
            borderRadius: crossThick / 2,
          }}
        />
        <View
          style={{
            width: crossThick,
            height: crossLen,
            backgroundColor: color,
            borderRadius: crossThick / 2,
            position: 'absolute',
          }}
        />
      </View>
    </View>
  );
}

function LeafVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.09);
  const leafS = size * 0.62;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: leafS,
          height: leafS,
          borderTopLeftRadius: leafS * 0.85,
          borderBottomRightRadius: leafS * 0.85,
          borderBottomLeftRadius: leafS * 0.1,
          borderTopRightRadius: leafS * 0.1,
          borderColor: color,
          borderWidth: stroke,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: stroke,
            height: leafS * 1.2,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
    </View>
  );
}

function ChevronVector({
  size,
  color,
  direction,
}: {
  size: number;
  color: string;
  direction: 'back' | 'forward';
}) {
  const stroke = Math.max(1.8, size * 0.12);
  const arm = size * 0.38;
  const isBack = direction === 'back';
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: arm,
          height: arm,
          borderLeftWidth: isBack ? stroke : 0,
          borderBottomWidth: isBack ? stroke : 0,
          borderRightWidth: isBack ? 0 : stroke,
          borderTopWidth: isBack ? 0 : stroke,
          borderColor: color,
          borderRadius: stroke * 0.5,
          transform: [
            { rotate: '45deg' },
            { translateX: isBack ? arm * 0.15 : -arm * 0.15 },
          ],
        }}
      />
    </View>
  );
}

function CheckVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.8, size * 0.12);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.3,
          height: size * 0.55,
          borderBottomWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          borderRadius: stroke * 0.4,
          transform: [{ rotate: '45deg' }, { translateY: -size * 0.06 }],
        }}
      />
    </View>
  );
}

function CloseVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.8, size * 0.12);
  const len = size * 0.65;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: len,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: len,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
        }}
      />
    </View>
  );
}

function AddVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.8, size * 0.12);
  const len = size * 0.65;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: len,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
      <View
        style={{
          width: stroke,
          height: len,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
        }}
      />
    </View>
  );
}

function RemoveVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.8, size * 0.12);
  const len = size * 0.65;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: len,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
    </View>
  );
}

function PersonVector({
  size,
  color,
  outline,
}: {
  size: number;
  color: string;
  outline?: boolean;
}) {
  const stroke = Math.max(1.5, size * 0.09);
  const headSize = size * 0.36;
  const bodyW = size * 0.65;
  const bodyH = size * 0.32;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: outline ? 'transparent' : color,
          borderColor: color,
          borderWidth: outline ? stroke : 0,
          position: 'absolute',
          top: size * 0.12,
        }}
      />
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderTopLeftRadius: bodyW / 2,
          borderTopRightRadius: bodyW / 2,
          backgroundColor: outline ? 'transparent' : color,
          borderColor: color,
          borderWidth: outline ? stroke : 0,
          position: 'absolute',
          bottom: size * 0.12,
        }}
      />
    </View>
  );
}

function CloudOfflineVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.68,
          height: size * 0.44,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.22,
          position: 'absolute',
          bottom: size * 0.24,
        }}
      />
      <View
        style={{
          width: stroke,
          height: size * 0.8,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function DocumentVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  const docW = size * 0.6;
  const docH = size * 0.74;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: docW,
          height: docH,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.08,
          padding: size * 0.08,
          justifyContent: 'space-evenly',
        }}
      >
        <View
          style={{
            width: '80%',
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
        <View
          style={{
            width: '100%',
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
        <View
          style={{
            width: '60%',
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
      </View>
    </View>
  );
}

function ImageVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  const imgW = size * 0.74;
  const imgH = size * 0.6;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: imgW,
          height: imgH,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.1,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: size * 0.07,
            backgroundColor: color,
            position: 'absolute',
            top: size * 0.08,
            right: size * 0.1,
          }}
        />
        <View
          style={{
            width: size * 0.45,
            height: size * 0.45,
            backgroundColor: color,
            position: 'absolute',
            bottom: -size * 0.2,
            left: size * 0.06,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}

function AttachVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.38,
          height: size * 0.68,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.19,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function InfoVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: (size * 0.75) / 2,
          borderColor: color,
          borderWidth: stroke,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: stroke * 1.2,
            height: stroke * 1.2,
            borderRadius: stroke * 0.6,
            backgroundColor: color,
            position: 'absolute',
            top: size * 0.14,
          }}
        />
        <View
          style={{
            width: stroke,
            height: size * 0.28,
            backgroundColor: color,
            borderRadius: stroke / 2,
            position: 'absolute',
            bottom: size * 0.14,
          }}
        />
      </View>
    </View>
  );
}

function WarningVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.62,
          height: size * 0.62,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.08,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: stroke * 1.1,
          height: size * 0.24,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          top: size * 0.2,
        }}
      />
      <View
        style={{
          width: stroke * 1.2,
          height: stroke * 1.2,
          borderRadius: stroke * 0.6,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.2,
        }}
      />
    </View>
  );
}

function FolderOpenVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.4,
          height: size * 0.16,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.06,
          borderTopRightRadius: size * 0.06,
          position: 'absolute',
          top: size * 0.16,
          left: size * 0.14,
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.5,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.08,
          position: 'absolute',
          bottom: size * 0.18,
        }}
      />
    </View>
  );
}

function AlbumsVector({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.4, size * 0.09);
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.12,
        }}
      />
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.08,
          position: 'absolute',
          bottom: size * 0.12,
          right: size * 0.12,
        }}
      />
    </View>
  );
}

function ArrowVector({
  size,
  color,
  direction,
}: {
  size: number;
  color: string;
  direction: 'up' | 'down';
}) {
  const stroke = Math.max(1.6, size * 0.1);
  const isUp = direction === 'up';
  const arm = size * 0.32;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: stroke,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
      <View
        style={{
          width: arm,
          height: arm,
          borderLeftWidth: stroke,
          borderTopWidth: isUp ? stroke : 0,
          borderBottomWidth: isUp ? 0 : stroke,
          borderColor: color,
          position: 'absolute',
          top: isUp ? size * 0.18 : undefined,
          bottom: isUp ? undefined : size * 0.18,
          transform: [{ rotate: isUp ? '45deg' : '-45deg' }],
        }}
      />
    </View>
  );
}

/**
 * Themed vector icon for the app. Renders crisp vector shapes natively
 * without font-loading issues on both iOS and Android.
 */
export function AppIcon({ name, size = 20, color = 'primary', style }: AppIconProps) {
  const theme = useThemeStore(s => s.theme);
  const palette = theme.colors as unknown as Record<string, string>;
  const resolvedColor =
    color in palette ? palette[color as string] : (color as string);

  let iconContent: React.ReactNode = null;

  switch (name) {
    case 'search':
      iconContent = <SearchVector size={size} color={resolvedColor} />;
      break;
    case 'filter':
      iconContent = <FilterVector size={size} color={resolvedColor} />;
      break;
    case 'star':
      iconContent = <StarVector size={size} color={resolvedColor} />;
      break;
    case 'heart':
      iconContent = <HeartVector size={size} color={resolvedColor} />;
      break;
    case 'heartOutline':
      iconContent = <HeartVector size={size} color={resolvedColor} outline />;
      break;
    case 'cart':
      iconContent = <CartVector size={size} color={resolvedColor} />;
      break;
    case 'bagHandle':
      iconContent = <BagVector size={size} color={resolvedColor} />;
      break;
    case 'calendar':
      iconContent = <CalendarVector size={size} color={resolvedColor} />;
      break;
    case 'pulse':
      iconContent = <PulseVector size={size} color={resolvedColor} />;
      break;
    case 'medkit':
    case 'medical':
      iconContent = <MedkitVector size={size} color={resolvedColor} />;
      break;
    case 'leaf':
      iconContent = <LeafVector size={size} color={resolvedColor} />;
      break;
    case 'cloudOffline':
    case 'wifiOff':
      iconContent = <CloudOfflineVector size={size} color={resolvedColor} />;
      break;
    case 'chevronBack':
      iconContent = <ChevronVector size={size} color={resolvedColor} direction="back" />;
      break;
    case 'chevronForward':
      iconContent = <ChevronVector size={size} color={resolvedColor} direction="forward" />;
      break;
    case 'check':
      iconContent = <CheckVector size={size} color={resolvedColor} />;
      break;
    case 'close':
      iconContent = <CloseVector size={size} color={resolvedColor} />;
      break;
    case 'add':
      iconContent = <AddVector size={size} color={resolvedColor} />;
      break;
    case 'remove':
      iconContent = <RemoveVector size={size} color={resolvedColor} />;
      break;
    case 'person':
      iconContent = <PersonVector size={size} color={resolvedColor} />;
      break;
    case 'personOutline':
      iconContent = <PersonVector size={size} color={resolvedColor} outline />;
      break;
    case 'folderOpen':
      iconContent = <FolderOpenVector size={size} color={resolvedColor} />;
      break;
    case 'document':
      iconContent = <DocumentVector size={size} color={resolvedColor} />;
      break;
    case 'image':
      iconContent = <ImageVector size={size} color={resolvedColor} />;
      break;
    case 'attach':
      iconContent = <AttachVector size={size} color={resolvedColor} />;
      break;
    case 'info':
      iconContent = <InfoVector size={size} color={resolvedColor} />;
      break;
    case 'warning':
      iconContent = <WarningVector size={size} color={resolvedColor} />;
      break;
    case 'arrowUp':
      iconContent = <ArrowVector size={size} color={resolvedColor} direction="up" />;
      break;
    case 'arrowDown':
      iconContent = <ArrowVector size={size} color={resolvedColor} direction="down" />;
      break;
    case 'albumsOutline':
    default:
      iconContent = <AlbumsVector size={size} color={resolvedColor} />;
      break;
  }

  return (
    <View
      style={[
        styles.center,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={name}
    >
      {iconContent}
    </View>
  );
}

/** Animated variant for scale/pop effects (e.g. the wishlist heart). */
export const AnimatedAppIcon = Animated.createAnimatedComponent(AppIcon);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppIcon;
