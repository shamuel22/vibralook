/**
 * Design tokens — 1:1 translation of DESIGN.md §3 for React Native.
 * Never hardcode a color, spacing or duration in a component; import it from here.
 */
import { Easing } from 'react-native-reanimated';

export const colors = {
  ink: '#24172B',
  cream: '#FFF8F2',
  orchid: '#B58BDD',
  coral: '#F46E64',
  rose: '#D8A2AB',
  sand: '#D6BFAE',
  white: '#FFFFFF',
  muted: '#6C5A70',
  line: '#E9DDE5',
  success: '#396B58',
  error: '#A23E4B',
  /** Translucent ink used for scrims over photos (status pills, "Ver antes"). */
  inkScrim: 'rgba(36, 23, 43, 0.72)',
  /** Soft surface for notices and the selected-state wash. */
  creamDeep: '#F7ECE6',
  /** Pressed surface of primary (ink) buttons. */
  inkPressed: '#3A2843',
  /** Notice surfaces: always paired with icon + text in the matching functional color. */
  errorSoft: '#FBEDEE',
  errorLine: '#EBC5CA',
  successSoft: '#ECF4EF',
  successLine: '#C6DCCF',
} as const;

/** `--vl-ribbon`: 115deg orchid → rose → coral. Use with expo-linear-gradient. */
export const ribbon = {
  colors: [colors.orchid, colors.rose, colors.coral] as const,
  locations: [0, 0.52, 1] as const,
  // 115deg expressed as start/end points.
  start: { x: 0, y: 0.29 },
  end: { x: 1, y: 0.71 },
};

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

/** `--vl-shadow-card` / `--vl-shadow-float`, iOS shadow + Android elevation. */
export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  float: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const layout = {
  /** Horizontal page gutter (DESIGN: 16–20). */
  gutter: 20,
  /** Max content width on tablets (DESIGN: 560). */
  maxWidth: 560,
  /** Minimum touch target (iOS 44pt; Android 48dp is reached with hitSlop). */
  minTouch: 44,
  buttonHeight: 54,
  headerHeight: 52,
} as const;

/** DESIGN §3 motion tokens. Durations in ms. */
export const motion = {
  quick: 120,
  base: 220,
  emphasis: 360,
  scene: 560,
  /** Stagger between up to three cards (DESIGN §6: 70–90ms). */
  stagger: 80,
  ribbonCycle: 8000,
} as const;

/** DESIGN §3 curves + animate-expo strong ease-out for press feedback. */
export const easing = {
  standard: Easing.bezier(0.22, 1, 0.36, 1),
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
} as const;

/** Springs for anything a finger drives (animate-expo table). */
export const spring = {
  settle: { duration: 400, dampingRatio: 1 },
  snapBack: { duration: 400, dampingRatio: 0.8 },
} as const;
