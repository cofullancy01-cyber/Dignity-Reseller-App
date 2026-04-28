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
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Count-up number animation
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

// Shimmer loading skeleton
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
        <View
          style={{
            width: '40%',
            backgroundColor: Colors.neutral[200],
            opacity: 0.5,
          }}
        />
        <View style={{ width: '30%', backgroundColor: Colors.neutral[100] }} />
      </Animated.View>
    </View>
  );
}

// Full-page shimmer loading
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

// Floating particle
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

// Particle field for headers
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
        <FloatingParticle
          key={p.id}
          delay={p.delay}
          size={p.size}
          startX={p.x}
          startY={p.y}
        />
      ))}
    </View>
  );
}

// Pulsing dot indicator
export function PulsingDot({
  color = Colors.error[500],
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
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
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// Sound wave bars
export function SoundWaveBars({
  barCount = 5,
  color = Colors.white,
  maxHeight = 20,
}: {
  barCount?: number;
  color?: string;
  maxHeight?: number;
}) {
  const bars = useRef(
    Array.from({ length: barCount }, (_, i) => ({
      id: i,
      height: useSharedValue(4),
    }))
  ).current;

  useEffect(() => {
    bars.forEach((bar, i) => {
      bar.height.value = withDelay(
        i * 100,
        withRepeat(
          withSequence(
            withTiming(maxHeight * (0.3 + Math.random() * 0.7), { duration: 300 + Math.random() * 400 }),
            withTiming(4, { duration: 300 + Math.random() * 400 })
          ),
          -1,
          true
        )
      );
    });
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: maxHeight }}>
      {bars.map((bar, i) => {
        const barStyle = useAnimatedStyle(() => ({
          height: bar.height.value,
        }));
        return (
          <Animated.View
            key={i}
            style={[
              {
                width: 3,
                borderRadius: 2,
                backgroundColor: color,
              },
              barStyle,
            ]}
          />
        );
      })}
    </View>
  );
}

// Floating emoji reaction
export function FloatingEmoji({
  emoji,
  startDelay = 0,
  startX = SCREEN_WIDTH / 2,
}: {
  emoji: string;
  startDelay?: number;
  startX?: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      startDelay,
      withSequence(
        withTiming(-300, { duration: 3000 }),
        withTiming(-400, { duration: 500 })
      )
    );
    opacity.value = withDelay(
      startDelay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 700 })
      )
    );
    scale.value = withDelay(
      startDelay,
      withSequence(
        withSpring(1, { damping: 8 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0.5, { duration: 700 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          bottom: 60,
          left: startX - 15,
          fontSize: 28,
        },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// Confetti particle
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
    rotation.value = withDelay(
      confettiDelay,
      withRepeat(withTiming(360, { duration: 1000 }), 3, false)
    );
    opacity.value = withDelay(
      confettiDelay,
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1000 })
      )
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
        {
          position: 'absolute',
          top: -20,
          left: startX,
          width: 6,
          height: 6,
          backgroundColor: color,
          borderRadius: 1,
        },
        animatedStyle,
      ]}
    />
  );
}

// Confetti burst
export function ConfettiBurst({ count = 30 }: { count?: number }) {
  const [visible, setVisible] = useState(true);
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 500,
    }))
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

// Rotating crown for leaderboard #1
export function RotatingCrown({ size = 28 }: { size?: number }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(8, { duration: 1500 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 3 }),
        withSpring(1, { damping: 3 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: size * 0.8,
            height: size * 0.5,
            backgroundColor: Colors.white,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderBottomWidth: 2,
            borderBottomColor: Colors.white,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: Colors.white,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: size * 0.35,
            width: 4,
            height: 6,
            borderRadius: 2,
            backgroundColor: Colors.white,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: Colors.white,
          }}
        />
      </View>
    </Animated.View>
  );
}

// Glow pulse behind an element
export function GlowPulse({
  color = Colors.purple,
  size = 120,
}: {
  color?: string;
  size?: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
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
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// Shimmer sweep effect for buttons
export function ShimmerButton({
  children,
  style,
  shimmerColor = 'rgba(255,255,255,0.3)',
  interval = 3000,
}: {
  children: React.ReactNode;
  style?: any;
  shimmerColor?: string;
  interval?: number;
}) {
  const shimmerX = useSharedValue(-300);

  useEffect(() => {
    const animate = () => {
      shimmerX.value = withSequence(
        withTiming(-300, { duration: 0 }),
        withTiming(300, { duration: 1200 })
      );
    };
    animate();
    const timer = setInterval(animate, interval);
    return () => clearInterval(timer);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View style={[{ overflow: 'hidden', borderRadius: style?.borderRadius || 12 }, style]}>
      {children}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 150,
            backgroundColor: shimmerColor,
            transform: [{ skewX: '-20deg' }],
          },
          shimmerStyle,
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

// Animated gradient background (simulated with color transitions)
export function AnimatedGradientBg() {
  const color1 = useSharedValue(0);
  const color2 = useSharedValue(0);

  useEffect(() => {
    color1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000 }),
        withTiming(0, { duration: 8000 })
      ),
      -1,
      true
    );
    color2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 8000 }),
        withTiming(1, { duration: 8000 })
      ),
      -1,
      true
    );
  }, []);

  const bgStyle = useAnimatedStyle(() => {
    const r1 = interpolate(color1.value, [0, 1], [74, 107], Extrapolation.CLAMP);
    const g1 = interpolate(color1.value, [0, 1], [25, 45], Extrapolation.CLAMP);
    const b1 = interpolate(color1.value, [0, 1], [66, 107], Extrapolation.CLAMP);

    return {
      backgroundColor: `rgb(${Math.round(r1)}, ${Math.round(g1)}, ${Math.round(b1)})`,
    };
  });

  return <Animated.View style={[StyleSheet.absoluteFill, bgStyle]} />;
}

// Floating organic shape for login background
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

// Progress ring for completed modules
export function ProgressRing({
  progress = 1,
  size = 24,
  strokeWidth = 3,
  color = Colors.purple,
}: {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const animatedProgress = useSharedValue(0);
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
    const interval = setInterval(() => {
      setFillWidth(animatedProgress.value * (size - strokeWidth * 2));
    }, 16);
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: Colors.neutral[200],
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: fillWidth >= (size - strokeWidth * 2) * 0.95 ? color : 'transparent',
          }}
        />
      </View>
    </View>
  );
}

// Bounce animation wrapper
export function BounceOnMount({
  children,
  delay: bounceDelay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      bounceDelay,
      withSpring(1, { damping: 6, stiffness: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// Slide in from bottom
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

// Slide in from right
export function SlideInFromRight({
  children,
  delay: slideDelay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
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

// Slide in from left
export function SlideInFromLeft({
  children,
  delay: slideDelay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const translateX = useSharedValue(-100);
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

// Fade in from below
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

// Purple glow pulse for cards
export function PurpleGlowPulse() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.95, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          borderRadius: 12,
          shadowColor: Colors.purple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 12,
          elevation: 8,
          backgroundColor: 'transparent',
        },
        animatedStyle,
      ]}
      pointerEvents="none"
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
