import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';


const { width, height } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.9;
export const CARD_HEIGHT = height * 0.7;

interface SwipeCardProps {
    item: {
        id: number;
        name: string;
        description: string;
        address: string;
        imageUrl: string;
        categoryName: string;
    };
}

export default function SwipeCard({ item }: SwipeCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.imageOverlay}
                />
            </View>

            <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.infoContainer}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.category, { color: theme.tabIconDefault }]}>{item.categoryName.toUpperCase()}</Text>
                        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    </View>
                    <LinearGradient
                        colors={theme.accentGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ratingContainer}
                    >
                        <Ionicons name="star" size={12} color="white" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </LinearGradient>

                </View>


                <View style={styles.addressContainer}>
                    <Ionicons name="location" size={16} color={theme.tabIconDefault} />
                    <Text style={[styles.address, { color: theme.tabIconDefault }]} numberOfLines={1}>
                        {item.address}
                    </Text>
                </View>

                <Text style={[styles.description, { color: theme.text }]} numberOfLines={3}>
                    {item.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.tag}>
                        <Ionicons name="time-outline" size={14} color={theme.tabIconDefault} />
                        <Text style={[styles.tagText, { color: theme.tabIconDefault }]}>20-30 min</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="wallet-outline" size={14} color={theme.tabIconDefault} />
                        <Text style={[styles.tagText, { color: theme.tabIconDefault }]}>$$</Text>
                    </View>
                </View>
            </BlurView>

            {/* Action Indicators (Hidden by default, used for animations) */}
            <View style={styles.overlayLabels}>
                {/* These would be animated based on swipe position */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 30,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    imageContainer: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 10,
    },
    category: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    name: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },

    ratingText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 4,
    },
    address: {
        fontSize: 14,
        fontWeight: '500',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
        opacity: 0.9,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    overlayLabels: {
        ...StyleSheet.absoluteFillObject,
        padding: 40,
        justifyContent: 'space-between',
        pointerEvents: 'none',
    },
});
