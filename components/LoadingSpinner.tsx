import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Fade in animation
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    fadeIn.start();
    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E', '#FFD93D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Floating Food Icons */}
      <View style={styles.floatingIcons}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.iconText}>🍕</Text>
        </Animated.View>
        <Animated.View style={[styles.iconCircle, styles.iconCircle2, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.iconText}>🍔</Text>
        </Animated.View>
        <Animated.View style={[styles.iconCircle, styles.iconCircle3, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.iconText}>🍜</Text>
        </Animated.View>
        <Animated.View style={[styles.iconCircle, styles.iconCircle4, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.iconText}>🍰</Text>
        </Animated.View>
      </View>

      {/* Main Loading Content */}
      <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoCircle,
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
          >
            <Text style={styles.logoText}>🍽️</Text>
          </Animated.View>
        </View>

        {/* Loading Text */}
        <Text style={styles.brandTitle}>Haat</Text>
        <Text style={styles.brandSubtitle}>Food Delivery</Text>
        
        {/* Loading Indicator */}
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Loading Dots */}
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        </View>
      </Animated.View>

      {/* Bottom Decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.waveContainer}>
          <View style={styles.wave} />
          <View style={[styles.wave, styles.wave2]} />
          <View style={[styles.wave, styles.wave3]} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    top: '15%',
    right: '20%',
  },
  iconCircle2: {
    top: '25%',
    left: '15%',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconCircle3: {
    top: '60%',
    right: '10%',
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  iconCircle4: {
    top: '70%',
    left: '25%',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconText: {
    fontSize: 24,
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 60,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  message: {
    marginTop: 16,
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginHorizontal: 6,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    transform: [{ scaleX: 1.5 }],
  },
  wave2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ scaleX: 2 }],
  },
  wave3: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ scaleX: 2.5 }],
  },
});

export default LoadingSpinner; 