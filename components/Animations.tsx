import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CountUp({
  value,
  delay = 0,
  duration = 1200,
  style,
}: {
  value: number;
  delay?: number;
  duration?: number;
  style?: any;
}) {
  const count = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      count.value = withTiming(value, { duration });
    }, delay);
    const interval = setInterval(() => {
      setDisplay(Math.round(count.value));
    }, 16);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [value, delay, duration]);

  return <Animated.Text style={style}>{display.toLocaleString()}</Animated.Text>;
}

export function ShimmerSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}) {
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value * (typeof width === 'number' ? width : 300) }],
  }));

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.neutral[100],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[{ flex: 1, flexDirection: 'row' }, animatedStyle]}>
        <View style={{ width: '30%', backgroundColor: Colors.neutral[100] }} />
        <View style={{ width: '40%', backgroundColor: Colors.neutral[200], opacity: 0.5 }} />
        <View style={{ width: '30%', backgroundColor: Colors.neutral[100] }} />
      </Animated.View>
    </View>
  );
}

export function ShimmerPage() {
  return (
    <View style={styles.shimmerPage}>
      <ShimmerSkeleton width="100%" height={120} borderRadius={0} style={{ marginBottom: 0 }} />
      <View style={{ padding: Spacing.md, gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <ShimmerSkeleton width="47%" height={100} borderRadius={12} />
          <ShimmerSkeleton width="47%" height={100} borderRadius={12} />
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <ShimmerSkeleton width="47%" height={100} borderRadius={12} />
          <ShimmerSkeleton width="47%" height={100} borderRadius={12} />
        </View>
        <ShimmerSkeleton width="100%" height={80} borderRadius={12} />
        <ShimmerSkeleton width="100%" height={80} borderRadius={12} />
      </View>
    </View>
  );
}

export function FloatingParticle({
  delay: particleDelay = 0,
  size = 4,
  startX,
  startY,
}: {
  delay?: number;
  size?: number;
  startX?: number;
  startY?: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const x = startX ?? Math.random() * SCREEN_WIDTH;
  const y = startY ?? SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.3;

  useEffect(() => {
    translateY.value = withDelay(
      particleDelay,
      withRepeat(withTiming(-200, { duration: 4000 + Math.random() * 2000 }), -1, false)
    );
    translateX.value = withDelay(
      particleDelay,
      withRepeat(
        withSequence(
          withTiming(15 + Math.random() * 20, { duration: 2000 + Math.random() * 1000 }),
          withTiming(-15 - Math.random() * 20, { duration: 2000 + Math.random() * 1000 })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      particleDelay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.4)',
        },
        animatedStyle,
      ]}
    />
  );
}

export function ParticleField({ count = 15 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      size: 2 + Math.random() * 4,
      x: Math.random() * SCREEN_WIDTH,
      y: 20 + Math.random() * 100,
    }))
  ).current;

  return (
    <View style={styles.particleContainer} pointerEvents="none">
      {particles.map((p) => (
        <FloatingParticle key={p.id} delay={p.delay} size={p.size} startX={p.x} startY={p.y} />
      ))}
    </View>
  );
}

export function PulsingDot({ color = Colors.error[500], size = 8 }: { color?: string; size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, animatedStyle]}
    />
  );
}

export function BounceOnMount({ children, delay: bounceDelay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(bounceDelay, withSpring(1, { damping: 6, stiffness: 200 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function SlideInFromBottom({
  children,
  delay: slideDelay = 0,
  distance = 50,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}) {
  const translateY = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(slideDelay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(slideDelay, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function SlideInFromRight({ children, delay: slideDelay = 0 }: { children: React.ReactNode; delay?: number }) {
  const translateX = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(slideDelay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(slideDelay, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function FadeInFromBelow({
  children,
  delay: fadeDelay = 0,
  distance = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}) {
  const translateY = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(fadeDelay, withTiming(0, { duration: 600 }));
    opacity.value = withDelay(fadeDelay, withTiming(1, { duration: 600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function FloatingShape({
  delay: shapeDelay = 0,
  size = 40,
  color = 'rgba(139,74,139,0.15)',
}: {
  delay?: number;
  size?: number;
  color?: string;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);

  const startX = Math.random() * SCREEN_WIDTH;
  const startY = Math.random() * SCREEN_HEIGHT;

  useEffect(() => {
    translateY.value = withDelay(
      shapeDelay,
      withRepeat(
        withSequence(
          withTiming(-30 - Math.random() * 50, { duration: 6000 + Math.random() * 4000 }),
          withTiming(30 + Math.random() * 50, { duration: 6000 + Math.random() * 4000 })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      shapeDelay,
      withRepeat(
        withSequence(
          withTiming(20 + Math.random() * 30, { duration: 5000 + Math.random() * 3000 }),
          withTiming(-20 - Math.random() * 30, { duration: 5000 + Math.random() * 3000 })
        ),
        -1,
        true
      )
    );
    rotation.value = withDelay(
      shapeDelay,
      withRepeat(withTiming(360, { duration: 20000 + Math.random() * 10000 }), -1, false)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size * 1.3,
          borderRadius: size * 0.4,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

export function ConfettiParticle({ delay: confettiDelay = 0 }: { delay?: number }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const startX = Math.random() * SCREEN_WIDTH;
  const color = [Colors.purple, Colors.mediumPurple, Colors.lightPurple, Colors.white, Colors.error[500]][
    Math.floor(Math.random() * 5)
  ];

  useEffect(() => {
    translateY.value = withDelay(
      confettiDelay,
      withSequence(
        withTiming(SCREEN_HEIGHT * 0.6, { duration: 2000 }),
        withTiming(SCREEN_HEIGHT * 0.8, { duration: 500 })
      )
    );
    translateX.value = withDelay(
      confettiDelay,
      withRepeat(
        withSequence(
          withTiming(30 + Math.random() * 40, { duration: 800 }),
          withTiming(-30 - Math.random() * 40, { duration: 800 })
        ),
        3,
        true
      )
    );
    rotation.value = withDelay(confettiDelay, withRepeat(withTiming(360, { duration: 1000 }), 3, false));
    opacity.value = withDelay(
      confettiDelay,
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1000 }))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: -20, left: startX, width: 6, height: 6, backgroundColor: color, borderRadius: 1 },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiBurst({ count = 30 }: { count?: number }) {
  const [visible, setVisible] = useState(true);
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({ id: i, delay: Math.random() * 500 }))
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} />
      ))}
    </View>
  );
}

export function GlowPulse({ color = Colors.purple, size = 120 }: { color?: string; size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2000 }), withTiming(0.2, { duration: 2000 })),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 100,
  },
  shimmerPage: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
