import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { SERVER_URL } from '../../constants/Config';
import { useColorScheme } from '../../components/useColorScheme';
import { apiService } from '../../api/apiService';
import { authService } from '../../api/authService';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../../components/GradientButton';
import GlassView from '../../components/GlassView';
import { BlurView } from 'expo-blur';


interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    bio: string | null;
    swipesCount: number;
    groupsCount: number;
    avatarUrl: string | null;
}

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const userId = authService.getUserId();
            if (userId === 0) {
                router.replace('/login');
                return;
            }
            const data = await apiService.get(`/Users/${userId}`);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        router.replace('/login');
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    const stats = [
        { label: 'Swipes', value: profile?.swipesCount.toString() ?? '0' },
        { label: 'Groups', value: profile?.groupsCount.toString() ?? '0' },
        { label: 'Matches', value: '0' }, // Placeholder for now
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }} // Clear absolute tab bar
        >
            {/* Header / Cover Area */}
            <View style={styles.header}>
                <View style={styles.coverContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
                        style={styles.coverImage}
                    />
                    <LinearGradient
                        colors={['transparent', theme.background]}
                        style={styles.coverOverlay}
                    />
                </View>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={theme.primaryGradient as any}
                            style={styles.avatarGradient}
                        >
                            <Image
                                source={{ uri: profile?.avatarUrl?.startsWith('/') ? `${SERVER_URL}${profile.avatarUrl}` : (profile?.avatarUrl || `https://i.pravatar.cc/150?u=${profile?.email}`) }}
                                style={styles.avatar}
                            />
                        </LinearGradient>
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>{profile?.fullName || 'Yükleniyor...'}</Text>
                    <Text style={[styles.handle, { color: theme.tabIconDefault }]}>
                        {profile ? `@${profile.fullName.toLowerCase().replace(/\s/g, '')}` : ''}
                    </Text>
                    <Text style={[styles.bio, { color: theme.text }]}>
                        {profile?.bio ?? 'Henüz bir biyografi eklenmemiş. Kanzie ile yeni mekanlar keşfetmeye başla! ✨'}
                    </Text>
                </View>
            </View>


            {/* Stats Section with Glassmorphism */}
            <GlassView intensity={50} style={styles.statsContainer}>
                {stats.map((stat, index) => (
                    <View key={stat.label} style={[styles.statItem, index !== stats.length - 1 && { borderRightWidth: 1, borderRightColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                        <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>{stat.label}</Text>
                    </View>
                ))}
            </GlassView>


            {/* Action Buttons */}
            <View style={styles.actions}>
                <GradientButton
                    title="Profili Düzenle"
                    onPress={() => router.push('/edit-profile')}
                    style={styles.editButton}
                />
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                    onPress={() => router.push('/friends')}
                >
                    <Ionicons name="people" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={theme.error} />
                </TouchableOpacity>
            </View>


            {/* Collections Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Favori Mekanlar</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.tint }}>Tümünü Gör</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {[1, 2, 3].map((i) => (
                        <TouchableOpacity key={i} style={[styles.spotCard, { backgroundColor: theme.card }]}>
                            <Image
                                source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}` }}
                                style={styles.spotImage}
                            />
                            <View style={styles.spotInfo}>
                                <Text style={[styles.spotName, { color: theme.text }]}>Kanzie Mekan {i}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color={theme.accent} />
                                    <Text style={[styles.ratingText, { color: theme.tabIconDefault }]}>4.9</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    coverContainer: {
        width: '100%',
        height: 200,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    profileInfo: {
        marginTop: -70,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        padding: 4,
        backgroundColor: 'transparent',
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
    avatarGradient: {
        flex: 1,
        borderRadius: 70,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 66,
        borderWidth: 4,
        borderColor: 'white',
    },
    name: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    handle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        opacity: 0.8,
    },
    bio: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 15,
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 24,
        paddingVertical: 20,
        marginBottom: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },

    actions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 35,
    },
    editButton: {
        flex: 1,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    settingsButton: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    horizontalScroll: {
        paddingLeft: 20,
        paddingRight: 10,
    },
    spotCard: {
        width: 200,
        borderRadius: 22,
        marginRight: 15,
        overflow: 'hidden',
        paddingBottom: 12,
    },
    spotImage: {
        width: '100%',
        height: 120,
    },
    spotInfo: {
        padding: 12,
    },
    spotName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
