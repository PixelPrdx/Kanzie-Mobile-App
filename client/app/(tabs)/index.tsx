import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeCard from '../../components/SwipeCard';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';



import { useEffect } from 'react';
import { apiService } from '../../api/apiService';
import { authService } from '../../api/authService';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  categoryName: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const userId = authService.getUserId();
      if (userId === 0) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      const venues = await apiService.get(`/Venues/next?userId=${userId}`);
      setData(venues);
      setIndex(0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      setLoading(false);
    }
  };

  const recordSwipe = async (venueId: number, isLike: boolean, isSuper: boolean = false) => {
    try {
      const userId = authService.getUserId();
      if (userId === 0) return;

      await apiService.post('/Venues/swipe', {
        userId: userId,
        venueId,
        isLike,
        isSuperLike: isSuper
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  };

  const onSwipeRight = useCallback((venueId: number) => {
    console.log('Liked!', venueId);
    recordSwipe(venueId, true);
    setIndex((prev) => prev + 1);
  }, []);

  const onSwipeLeft = useCallback((venueId: number) => {
    console.log('Skipped!', venueId);
    recordSwipe(venueId, false);
    setIndex((prev) => prev + 1);
  }, []);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        translateX.value = withSpring(
          Math.sign(event.translationX) * width * 1.5,
          {},
          (finished) => {
            if (finished) {
              const venueId = data[index].id;
              if (event.translationX > 0) {
                runOnJS(onSwipeRight)(venueId);
              } else {
                runOnJS(onSwipeLeft)(venueId);
              }
              translateX.value = 0;
              translateY.value = 0;
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [1, 0.9, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [1, 0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Finding perfect spots for you...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.background, '#f3e8ff', '#ffedd5'] as any}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>

          {/* Premium Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>Keşfet,</Text>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Kanzie Mekanlar</Text>
            </View>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
              <LinearGradient
                colors={theme.accentGradient as any}
                style={styles.dot}
              />

            </TouchableOpacity>
          </View>


          <View style={styles.cardsContainer}>
            {index < data.length ? (
              <>
                {/* Next Card */}
                {index + 1 < data.length && (
                  <Animated.View style={[styles.nextCard, nextCardStyle]}>
                    <SwipeCard item={data[index + 1]} />
                  </Animated.View>
                )}

                {/* Current Card */}
                <GestureDetector gesture={gesture}>
                  <Animated.View style={cardStyle}>
                    <SwipeCard item={data[index]} />
                  </Animated.View>
                </GestureDetector>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="refresh-circle" size={80} color={theme.tint} />
                <Text style={[styles.emptyText, { color: theme.text }]}>That's all for now!</Text>
                <TouchableOpacity
                  style={[styles.reloadButton, { backgroundColor: theme.tint }]}
                  onPress={fetchVenues}
                >
                  <Text style={styles.reloadText}>Reload Spots</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonActionContainer}>
            <TouchableOpacity
              onPress={() => index < data.length && onSwipeLeft(data[index].id)}
              style={[styles.roundButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <Ionicons name="close" size={32} color={theme.error} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => index < data.length && recordSwipe(data[index].id, true, true)}
              activeOpacity={0.8}
              style={[styles.starButtonContainer, { backgroundColor: 'white' }]}
            >
              <View style={styles.starButtonGradient}>
                <Ionicons name="star" size={35} color={theme.tint} />
              </View>
            </TouchableOpacity>


            <TouchableOpacity
              onPress={() => index < data.length && onSwipeRight(data[index].id)}
              style={[styles.roundButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <Ionicons name="heart" size={32} color={theme.accent} />
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  nextCard: {
    position: 'absolute',
    zIndex: -1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 20,
  },
  reloadButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reloadText: {
    color: 'white',
    fontWeight: '700',
  },
  buttonActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 110, // Increased to clear absolute tab bar
  },

  roundButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  starButtonContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  starButtonGradient: {
    flex: 1,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
