import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  interpolateColor,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Colors for the animation
const LUXURY_COLORS = {
  primary: '#D4AF37', // Matte gold
  secondary: '#0F4C81', // Night blue
  accent: '#8A3033', // Burgundy
  dark: '#2C3539', // Charcoal
  light: '#C0C0C0', // Matte silver
  steel: '#3A4660', // Steel blue
  sonar: '#4DEEEA', // Sonar blue (for radar effect)
  taupe: '#5F5449', // Taupe
  lavender: '#6B5B95', // Dark lavender
  success: '#2E8B57', // Emerald green for success
  error: '#8A3033', // Burgundy for error
};

const { width, height } = Dimensions.get('window');
const CONTAINER_SIZE = Math.min(width, height) * 0.8;
const CENTER = CONTAINER_SIZE / 2;

// Generate radar circles
const generateRadarCircles = (count: number) => {
  const circles = [];
  const minRadius = CONTAINER_SIZE * 0.1;
  const maxRadius = CONTAINER_SIZE * 0.45;
  
  // Optimize the number of circles for performance
  const optimizedCount = Math.min(count, 5);
  
  for (let i = 0; i < optimizedCount; i++) {
    const radius = minRadius + ((maxRadius - minRadius) * (i / (optimizedCount - 1)));
    const thickness = 1 + (i === 0 ? 1.5 : 0.5); // Central circle thicker
    
    circles.push({
      id: `circle-${i}`,
      radius,
      thickness,
      opacity: 0.7 - (i * 0.1), // Outer circles more transparent
      delay: i * 200,
    });
  }
  
  return circles;
};

// Generate radar sweep rays
const generateRadarSweeps = (count: number) => {
  const sweeps = [];
  
  // Create a smoother color gradient
  const baseColor = LUXURY_COLORS.sonar;
  const baseOpacity = 0.95;
  const opacityStep = 0.7 / count;
  const delayStep = 200 / count; // Larger offset to space out the lines
  
  for (let i = 0; i < count; i++) {
    // Calculate opacity for this ray
    const opacity = baseOpacity - (i * opacityStep);
    // Calculate color with a smoother transition
    const colorOpacity = Math.max(0.15, 0.9 - (i * (0.75 / count)));
    const color = i < 3 ? baseColor : `rgba(77, 238, 234, ${colorOpacity})`;
    
    sweeps.push({
      id: `radar-sweep-${i}`,
      delay: i * delayStep,
      width: CONTAINER_SIZE * 0.45, // Longueur du rayon
      opacity: opacity,
      color: color,
    });
  }
  
  return sweeps;
};

// Generate signal points on the radar
const generateRadarSignals = (count: number) => {
  const signals = [];
  
  for (let i = 0; i < count; i++) {
    // Random position on the radar
    const angle = Math.random() * 2 * Math.PI;
    const distance = (0.2 + Math.random() * 0.7) * CONTAINER_SIZE * 0.45;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // Signal properties
    const size = 3 + Math.random() * 4;
    const strength = 0.3 + Math.random() * 0.7;
    const pulseSpeed = 0.5 + Math.random() * 1.5;
    const isStatic = Math.random() > 0.7; // Some signals are static
    
    signals.push({
      id: `signal-${i}`,
      x,
      y,
      angle,
      distance,
      size,
      strength,
      pulseSpeed,
      isStatic,
      isVisible: false, // Initially invisible, revealed by the sweep
      lastSweepTime: 0,
    });
  }
  
  return signals;
};

// Generate coordinate grids for the radar
const generateGridLines = () => {
  const gridLines = [];
  const gridCount = 4; // Nombre de lignes de grille
  
  // Horizontal and vertical lines
  for (let i = 0; i < gridCount; i++) {
    const offset = ((i + 1) / gridCount) * CONTAINER_SIZE * 0.45;
    
    // Horizontal line
    gridLines.push({
      id: `grid-h-${i}`,
      startX: -offset,
      startY: 0,
      endX: offset,
      endY: 0,
      thickness: i === 0 ? 1.5 : 0.8,
      opacity: 0.3,
    });
    
    // Vertical line
    gridLines.push({
      id: `grid-v-${i}`,
      startX: 0,
      startY: -offset,
      endX: 0,
      endY: offset,
      thickness: i === 0 ? 1.5 : 0.8,
      opacity: 0.3,
    });
  }
  
  // Diagonal lines for radar effect
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4; // 0, 45, 90, 135 degrees
    const radius = CONTAINER_SIZE * 0.45;
    const startX = 0;
    const startY = 0;
    const endX = Math.cos(angle) * radius;
    const endY = Math.sin(angle) * radius;
    
    gridLines.push({
      id: `grid-d-${i}`,
      startX,
      startY,
      endX,
      endY,
      thickness: 0.8,
      opacity: 0.2,
    });
  }
  
  return gridLines;
};

type RadarCircle = {
  id: string;
  radius: number;
  thickness: number;
  opacity: number;
  delay: number;
};

type RadarSweep = {
  id: string;
  delay: number;
  width: number;
  opacity: number;
  color: string;
};

type RadarSignal = {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  strength: number;
  pulseSpeed: number;
  isStatic: boolean;
  isVisible: boolean;
};

type GridLine = {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  opacity: number;
};

export default function ConnectionScreen() {
  // States for radar elements
  const [radarCircles, setRadarCircles] = useState<RadarCircle[]>(generateRadarCircles(5));
  const [radarSweeps, setRadarSweeps] = useState<RadarSweep[]>(generateRadarSweeps(15)); // Fewer rays for a more spaced effect
  const [radarSignals, setRadarSignals] = useState<RadarSignal[]>(generateRadarSignals(15));
  const [gridLines, setGridLines] = useState<GridLine[]>(generateGridLines());
  const [radarEnergy, setRadarEnergy] = useState(0.5);
  const [isNearReader, setIsNearReader] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const connectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Shared animations with initial values to avoid unnecessary calculations
  const timeValue = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);
  const energyAnimation = useSharedValue(0.5); // Start at midpoint to avoid abrupt transitions
  const proximityAnimation = useSharedValue(0);
  
  // State to track connection result (null = in progress, true = success, false = failure)
  const [connectionResult, setConnectionResult] = useState<boolean | null>(null);
  
  // Function to simulate or cancel the current connection
  const toggleConnection = () => {
    if (!isNearReader) {
      // Simulate approaching a reader
      setIsNearReader(true);
      setConnectionResult(null); // Reset the result
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Start the connection process
      setConnectionProgress(0);
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
      
      connectionTimerRef.current = setInterval(() => {
        setConnectionProgress(prev => {
          const newProgress = prev + 0.01;
          if (newProgress >= 1) {
            if (connectionTimerRef.current) {
              clearInterval(connectionTimerRef.current);
              connectionTimerRef.current = null;
            }
            return 1;
          }
          return newProgress;
        });
      }, 50);
    } else {
      // Cancel the current connection
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
        connectionTimerRef.current = null;
      }
      
      // Haptic feedback to indicate cancellation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Reset the state
      setIsNearReader(false);
      setConnectionProgress(0);
      setConnectionResult(null);
    }
  };
  
  // Function to simulate a successful connection
  const simulateSuccessfulConnection = () => {
    if (isNearReader && connectionProgress >= 1) {
      // Haptic feedback to indicate success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Update the state
      setConnectionResult(true);
      
      // Return to initial state after a delay
      setTimeout(() => {
        setIsNearReader(false);
        setConnectionProgress(0);
        setConnectionResult(null);
      }, 2000);
    }
  };
  
  // Function to simulate a failed connection
  const simulateFailedConnection = () => {
    if (isNearReader && connectionProgress >= 1) {
      // Haptic feedback to indicate failure
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Update the state
      setConnectionResult(false);
      
      // Return to initial state after a delay
      setTimeout(() => {
        setIsNearReader(false);
        setConnectionProgress(0);
        setConnectionResult(null);
      }, 2000);
    }
  };
  
  // Simulate NFC reader proximity detection (automatic every 15 seconds)
  useEffect(() => {
    // Simulation: alternate between proximity and distance every 15 seconds
    const interval = setInterval(() => {
      if (!isNearReader) {
        toggleConnection();
      }
    }, 15000); // Every 15 seconds for the demo
    
    return () => {
      clearInterval(interval);
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    };
  }, [isNearReader]);
  
  // Update proximity animation
  useEffect(() => {
    proximityAnimation.value = withTiming(
      isNearReader ? 1 : 0,
      { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
    
    // Radar intensity animation during connection
    if (isNearReader) {
      energyAnimation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    } else {
      energyAnimation.value = withRepeat(
        withTiming(0.7, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [isNearReader]);
  
  // Proximity effect during connection
  useEffect(() => {
    if (isNearReader) {
      proximityAnimation.value = withTiming(1, { duration: 500 });
      
      // Update radar signal visibility
      setRadarSignals(prev => prev.map(signal => ({
        ...signal,
        isVisible: true
      })));
    } else {
      proximityAnimation.value = withTiming(0, { duration: 500 });
      
      // Reset radar signals
      setRadarSignals(prev => prev.map(signal => ({
        ...signal,
        isVisible: signal.isStatic
      })));
    }
  }, [isNearReader]);
  
  // Effect to handle connection result
  useEffect(() => {
    if (connectionResult !== null) {
      // Change radar color based on result
      const resultColor = connectionResult ? 
        LUXURY_COLORS.success : 
        LUXURY_COLORS.error;
      
      // Update ray colors
      setRadarSweeps(prev => prev.map((sweep, index) => ({
        ...sweep,
        color: index < 3 ? resultColor : `rgba(${connectionResult ? '46, 139, 87' : '138, 48, 51'}, ${0.8 - (index * 0.05)})`
      })));
    } else if (!isNearReader) {
      // Reset ray colors
      setRadarSweeps(generateRadarSweeps(15));
    }
  }, [connectionResult, isNearReader]);
  
  // Continuous animations
  useEffect(() => {
    // Global time animation - longer duration for smoother movements
    const runTimeAnimation = () => {
      timeValue.value = 0;
      timeValue.value = withRepeat(
        withTiming(1, { duration: 15000, easing: Easing.linear }),
        -1,
        false
      );
    };
    
    // Slow rotation animation for radar sweep
    const runRotationAnimation = () => {
      rotationAnimation.value = 0;
      rotationAnimation.value = withRepeat(
        withTiming(2 * Math.PI, { duration: 8000, easing: Easing.linear }), // Rotation plus lente
        -1,
        false
      );
    };
    
    // Pulsing energy animation - smoother transitions
    const runEnergyAnimation = () => {
      energyAnimation.value = withRepeat(
        withTiming(1, { 
          duration: 3000, 
          easing: Easing.inOut(Easing.cubic)
        }),
        -1,
        true // smoother transitions
      );
    };
    
    runTimeAnimation();
    runRotationAnimation();
    runEnergyAnimation();
    
    return () => {
      cancelAnimation(timeValue);
      cancelAnimation(rotationAnimation);
      cancelAnimation(energyAnimation);
      // Cancel all active animations
    };
  }, []);
  
  // Style for connection overlay
  const connectionOverlayStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      proximityAnimation.value,
      [0, 1],
      ['rgba(0, 0, 0, 0)', 'rgba(212, 175, 55, 0.15)']
    );
    
    return {
      backgroundColor,
      opacity: proximityAnimation.value,
    };
  });
  
  // Style for animation container - optimized for fluidity
  const animationContainerStyle = useAnimatedStyle(() => {
    // Use a more subtle scale to reduce calculations
    const scale = isNearReader ? 
      1.03 : // Fixed value in connection mode
      1 + (energyAnimation.value * 0.03); // Reduce amplitude
    
    return {
      transform: [{ scale }],
    };
  });
  
  // Style for radar circles
  const getRadarCircleStyle = (circle: RadarCircle) => {
    return useAnimatedStyle(() => {
      const baseColor = LUXURY_COLORS.steel;
      const activeColor = LUXURY_COLORS.primary;
      
      const borderColor = interpolateColor(
        proximityAnimation.value,
        [0, 1],
        [baseColor, activeColor]
      );
      
      // Subtle pulsation for circles
      const scale = 1 + (energyAnimation.value * 0.02);
      
      // Variable opacity based on proximity
      const opacity = circle.opacity + 
        (proximityAnimation.value * 0.2) + 
        (energyAnimation.value * 0.1);
      
      return {
        borderColor,
        opacity,
        transform: [
          { scale }
        ],
      };
    });
  };
  
  // Style for radar signals
  const getRadarSignalStyle = (signal: RadarSignal) => {
    return useAnimatedStyle(() => {
      // Determine if the signal is visible (swept by radar)
      const sweepAngle = rotationAnimation.value;
      const signalAngle = signal.angle;
      
      // Calculate angle difference to determine if signal is visible
      let angleDiff = Math.abs(sweepAngle - signalAngle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      // Signal is visible if it's close to the sweep ray
      const isRecentlySwiped = angleDiff < 0.5;
      
      // Signal color based on strength and proximity
      const baseColor = signal.strength > 0.5 ? LUXURY_COLORS.secondary : LUXURY_COLORS.accent;
      const activeColor = LUXURY_COLORS.primary;
      
      const backgroundColor = interpolateColor(
        proximityAnimation.value,
        [0, 1],
        [baseColor, activeColor]
      );
      
      // Pulsation effect for signals
      const pulseValue = (1 + Math.sin(timeValue.value * 10 * signal.pulseSpeed)) / 2;
      const pulseScale = 1 + (pulseValue * 0.3 * signal.strength);
      
      // Variable size based on signal strength
      const size = signal.size * (1 + (proximityAnimation.value * 0.3));
      
      // Variable opacity based on visibility
      const fadeEffect = isRecentlySwiped ? 1 : Math.max(0, 1 - (sweepAngle - signalAngle + 2 * Math.PI) % (2 * Math.PI));
      const opacity = signal.isStatic ? 
        0.3 + (signal.strength * 0.4) + (proximityAnimation.value * 0.3) :
        fadeEffect * signal.strength * (0.5 + (proximityAnimation.value * 0.5));
      
      return {
        backgroundColor,
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity,
        transform: [
          { translateX: signal.x + CENTER },
          { translateY: signal.y + CENTER },
          { scale: pulseScale }
        ],
      };
    });
  };
  
  // Style for radar grid lines
  const getGridLineStyle = (line: GridLine) => {
    return useAnimatedStyle(() => {
      const baseColor = LUXURY_COLORS.steel;
      const activeColor = LUXURY_COLORS.primary;
      
      const backgroundColor = interpolateColor(
        proximityAnimation.value,
        [0, 1],
        [baseColor, activeColor]
      );
      
      // Calculate line length
      const dx = line.endX - line.startX;
      const dy = line.endY - line.startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Subtle pulsation effect
      const pulseEffect = 1 + (energyAnimation.value * 0.1);
      
      // Variable opacity based on proximity
      const opacity = line.opacity * pulseEffect * 
        (0.5 + (proximityAnimation.value * 0.5));
      
      return {
        backgroundColor,
        width: length,
        height: line.thickness,
        opacity,
        transform: [
          { translateX: line.startX + CENTER },
          { translateY: line.startY + CENTER },
          { rotate: `${angle}rad` },
          { translateY: -line.thickness / 2 }
        ],
      };
    });
  };
  
  // Generate styles for each sweep ray
  const getRadarSweepStyle = (sweep: RadarSweep) => {
    return useAnimatedStyle(() => {
      // Calculate sweep angle with very small offset
      const sweepAngle = rotationAnimation.value - (sweep.delay / 8000) * (2 * Math.PI);
      
      // Color and opacity variables based on proximity
      const baseColor = sweep.color;
      const activeColor = sweep.id.endsWith('0') || sweep.id.endsWith('1') ? 
        LUXURY_COLORS.primary : baseColor;
      
      const backgroundColor = interpolateColor(
        proximityAnimation.value,
        [0, 1],
        [baseColor, activeColor]
      );
      
      // Effet de fondu en queue plus subtil
      const tailEffect = 0.7 + (Math.sin(sweepAngle * 2) * 0.3);
      
      // Opacité variable pour l'effet de balayage
      const opacity = sweep.opacity * (0.8 + (proximityAnimation.value * 0.2)) * tailEffect;
      
      return {
        backgroundColor,
        width: sweep.width,
        height: 2,
        opacity,
        transform: [
          { translateX: CENTER },
          { translateY: CENTER },
          { rotate: `${sweepAngle}rad` },
          { translateY: -1 }
        ],
      };
    });
  };
  
  // Style for radar center
  const radarCenterStyle = useAnimatedStyle(() => {
    const baseColor = LUXURY_COLORS.primary;
    const activeColor = isNearReader ? LUXURY_COLORS.primary : LUXURY_COLORS.secondary;
    
    const backgroundColor = interpolateColor(
      proximityAnimation.value,
      [0, 1],
      [baseColor, activeColor]
    );
    
    // Size of radar center
    const size = isNearReader ? 
      20 : // Fixed size in connection mode
      15 * (1 + (energyAnimation.value * 0.2));
    
    // Variable opacity
    const opacity = 0.8 + (proximityAnimation.value * 0.2);
    
    // Pulsation effect
    const pulseEffect = 1 + (energyAnimation.value * 0.1);
    
    return {
      backgroundColor,
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity,
      transform: [
        { translateX: CENTER - size / 2 },
        { translateY: CENTER - size / 2 },
        { scale: pulseEffect }
      ],
    };
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Connection overlay */}
      <Animated.View style={[styles.connectionOverlay, connectionOverlayStyle]} />
      
      <View style={styles.content}>
        {/* Title and subtitle */}
        <Text style={styles.title}>
          {isNearReader ? 
            connectionResult === true ? 'Access granted' :
            connectionResult === false ? 'Access denied' :
            'Scanning...' : 
            'Bring your device closer'}
        </Text>
        <Text style={styles.subtitle}>
          {isNearReader
            ? connectionResult === true ? 'Badge recognized successfully' :
              connectionResult === false ? 'Badge not recognized or access denied' :
              `Signal search: ${Math.round(connectionProgress * 100)}%`
            : 'Place your phone near the reader'}
        </Text>
        
        {/* Quantum animation container */}
        <View style={styles.animationWrapper}>
          <Animated.View style={[styles.animationContainer, animationContainerStyle]}>
            {/* Radar concentric circles */}
            {radarCircles.map((circle) => (
              <Animated.View
                key={circle.id}
                style={[
                  styles.radarCircle,
                  { 
                    width: circle.radius * 2, 
                    height: circle.radius * 2,
                    borderWidth: circle.thickness,
                    borderRadius: circle.radius,
                    left: CENTER - circle.radius,
                    top: CENTER - circle.radius
                  },
                  getRadarCircleStyle(circle)
                ]}
              />
            ))}
            
            {/* Radar grid lines */}
            {gridLines.map((line) => (
              <Animated.View
                key={line.id}
                style={[
                  styles.gridLine,
                  getGridLineStyle(line)
                ]}
              />
            ))}
            
            {/* Radar signal points */}
            {radarSignals.map((signal) => (
              <Animated.View
                key={signal.id}
                style={[
                  styles.radarSignal,
                  getRadarSignalStyle(signal)
                ]}
              />
            ))}
            
            {/* Radar sweep rays */}
            {radarSweeps.map((sweep) => (
              <Animated.View 
                key={sweep.id} 
                style={[
                  styles.radarSweep, 
                  getRadarSweepStyle(sweep)
                ]} 
              />
            ))}
            
            {/* Radar center */}
            <Animated.View style={[styles.radarCenter, radarCenterStyle]} />
          </Animated.View>
        </View>
        
        {/* Connection icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isNearReader ? "radio-outline" : "scan-outline"} 
            size={48} 
            color={isNearReader ? LUXURY_COLORS.primary : "#FFFFFF"} 
          />
        </View>
      </View>
      
      {/* Test button to simulate/cancel connection */}
      <TouchableOpacity 
        style={[styles.testButton, isNearReader && styles.cancelButton]} 
        onPress={toggleConnection}
        activeOpacity={0.7}
      >
        <Text style={styles.testButtonText}>
          {isNearReader ? 'Cancel connection' : 'Simulate connection'}
        </Text>
      </TouchableOpacity>
      
      {/* Result simulation buttons (always visible) */}
      <View style={styles.resultButtonsContainer}>
        <TouchableOpacity 
          style={[styles.resultButton, styles.successButton, 
            (!isNearReader || connectionProgress < 1 || connectionResult !== null) && styles.disabledButton]} 
          onPress={simulateSuccessfulConnection}
          disabled={!isNearReader || connectionProgress < 1 || connectionResult !== null}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.resultButton, styles.errorButton,
            (!isNearReader || connectionProgress < 1 || connectionResult !== null) && styles.disabledButton]} 
          onPress={simulateFailedConnection}
          disabled={!isNearReader || connectionProgress < 1 || connectionResult !== null}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  connectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
  },
  animationWrapper: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  animationContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    position: 'relative',
  },
  radarCircle: {
    position: 'absolute',
    borderColor: 'rgba(15, 76, 129, 0.5)', // Night blue
    borderStyle: 'solid',
    top: 0,
    left: 0,
  },
  radarSignal: {
    position: 'absolute',
    backgroundColor: 'rgba(58, 70, 96, 0.9)', // Steel blue
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 76, 129, 0.3)', // Night blue
    transformOrigin: 'center',
    left: 0,
    top: 0,
  },
  radarSweep: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 76, 129, 0.7)', // Night blue
    transformOrigin: 'left',
    shadowColor: '#4DEEEA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 0,
    height: 2.5, // Slightly thicker lines
  },
  radarCenter: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 76, 129, 0.9)', // Night blue
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  quantumRing: {
    position: 'absolute',
    borderRadius: CONTAINER_SIZE,
    borderColor: LUXURY_COLORS.steel,
    backgroundColor: 'transparent',
  },
  qubit: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LUXURY_COLORS.secondary,
    left: CENTER,
    top: CENTER,
  },
  quantumConnection: {
    position: 'absolute',
    height: 1,
    backgroundColor: LUXURY_COLORS.light,
    opacity: 0.3,
  },
  quantumCore: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: LUXURY_COLORS.primary,
  },
  iconContainer: {
    marginTop: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  testButton: {
    position: 'absolute',
    bottom: 100,    // Higher position to avoid the menu bar
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.7)',
    borderRadius: 12,
    elevation: 5,
    zIndex: 90,    // Z-index lower than result buttons
  },
  cancelButton: {
    backgroundColor: 'rgba(138, 48, 51, 0.3)', // Semi-transparent bordeaux
    borderColor: 'rgba(138, 48, 51, 0.7)', // Bordeaux for the border
  },
  resultButtonsContainer: {
    position: 'absolute',
    bottom: 160,    // Even higher position to avoid the connection button
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 100, // Ensure buttons are above other elements
  },
  resultButton: {
    width: 55, // Adjusted size
    height: 55, // Adjusted size
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  successButton: {
    backgroundColor: 'rgba(46, 139, 87, 0.8)', // Semi-transparent emerald green
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 1)',
  },
  errorButton: {
    backgroundColor: 'rgba(138, 48, 51, 0.8)', // Semi-transparent burgundy
    borderWidth: 1,
    borderColor: 'rgba(138, 48, 51, 1)',
  },
  disabledButton: {
    opacity: 0.4,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    borderColor: 'rgba(100, 100, 100, 0.7)',
  },
  testButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});