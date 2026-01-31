import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import { SERVER_URL } from '../constants/Config';
import { LinearGradient } from 'expo-linear-gradient';
import GlassView from '../components/GlassView';
import GradientButton from '../components/GradientButton';
import { Platform } from 'react-native';


interface Friend {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
}

export default function FriendsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);

    const fetchFriends = async () => {
        try {
            const userId = authService.getUserId();
            if (!userId) return;

            setLoading(true);
            const friendsData = await apiService.get(`/Friendships/${userId}/list`);
            const requestsData = await apiService.get(`/Friendships/${userId}/pending`);

            setFriends(friendsData);
            setPendingRequests(requestsData);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
            Alert.alert('Hata', 'Arkadaş listesi yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const userId = authService.getUserId();
            const results = await apiService.get(`/Friendships/search?query=${encodeURIComponent(text)}&currentUserId=${userId}`);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const sendRequest = async (friendId: number) => {
        try {
            setAddingId(friendId);
            const userId = authService.getUserId();
            await apiService.post('/Friendships/send-request', { userId, friendId });
            Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi!');
            setSearchQuery('');
            setSearchResults([]);
            fetchFriends();
        } catch (error: any) {
            console.error('Send request error:', error);
            const errorMessage = error.message || 'İstek gönderilemedi.';
            Alert.alert('Hata', errorMessage);
        } finally {
            setAddingId(null);
        }
    };

    const acceptRequest = async (friendId: number) => {
        try {
            const userId = authService.getUserId();
            await apiService.post('/Friendships/accept-request', { userId, friendId });
            Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi!');
            fetchFriends(); // Refresh lists
        } catch (error) {
            console.error('Accept error:', error);
            Alert.alert('Hata', 'İstek kabul edilirken bir sorun oluştu.');
        }
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <View style={[styles.friendItem, { borderBottomColor: theme.border }]}>
            <Image
                source={{ uri: item.avatarUrl ? `${SERVER_URL}${item.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=random&size=100` }}
                style={styles.avatar}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: theme.text }]}>{item.fullName}</Text>
                <Text style={[styles.friendEmail, { color: theme.tabIconDefault }]}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.msgButton}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.tint} />
            </TouchableOpacity>
        </View>
    );
    const renderRequestItem = ({ item }: { item: Friend }) => (
        <GlassView intensity={40} style={styles.requestItem} borderRadius={20}>
            <Image
                source={{ uri: item.avatarUrl ? `${SERVER_URL}${item.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=random&size=100` }}
                style={styles.avatar}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: theme.text }]}>{item.fullName}</Text>
                <Text style={[styles.requestText, { color: theme.tabIconDefault }]}>Seni eklemek istiyor</Text>
            </View>
            <TouchableOpacity
                style={styles.acceptAction}
                onPress={() => acceptRequest(item.id)}
            >
                <LinearGradient
                    colors={theme.primaryGradient as any}
                    style={styles.acceptGradient}
                >
                    <Ionicons name="checkmark" size={20} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </GlassView>
    );



    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Arkadaşlarım</Text>
            </View>

            <View style={styles.addSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Yeni Birini Bul</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.tabIconDefault} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="İsim veya e-posta ile ara..."
                        placeholderTextColor={theme.tabIconDefault}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                    {searching && <ActivityIndicator size="small" color={theme.tint} />}
                </View>


                {searchResults.length > 0 && (
                    <View style={[styles.resultsContainer, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
                        {searchResults.map((result) => (
                            <TouchableOpacity
                                key={result.id}
                                style={styles.resultItem}
                                onPress={() => sendRequest(result.id)}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={{ uri: result.avatarUrl ? `${SERVER_URL}${result.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(result.fullName)}&background=random&size=100` }}
                                    style={styles.searchAvatar}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.resultName, { color: theme.text }]}>{result.fullName}</Text>
                                    <Text style={[styles.resultEmail, { color: theme.tabIconDefault }]}>{result.email}</Text>
                                </View>
                                {addingId === result.id ? (
                                    <ActivityIndicator size="small" color={theme.tint} />
                                ) : (
                                    <LinearGradient
                                        colors={theme.primaryGradient as any}
                                        style={styles.addIconBadge}
                                    >
                                        <Ionicons name="add" size={18} color="white" />
                                    </LinearGradient>

                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 20 }} />
            ) : (
                <>
                    {pendingRequests.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Bekleyen İstekler</Text>
                            <FlatList
                                data={pendingRequests}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderRequestItem}
                                scrollEnabled={false}
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Arkadaş Listesi ({friends.length})</Text>
                        <FlatList
                            data={friends}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderFriendItem}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>Henüz hiç arkadaşın yok.</Text>
                            }
                        />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    addSection: {
        marginBottom: 25,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 15,
        letterSpacing: -0.5,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 15,
        backgroundColor: '#f0f0f0',
    },
    friendInfo: {
        flex: 1,
    },

    friendName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    friendEmail: {
        fontSize: 13,
        fontWeight: '500',
    },

    requestText: {
        fontSize: 13,
        fontWeight: '600',
    },
    msgButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    acceptGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        marginTop: 10,
        borderRadius: 20,
        maxHeight: 300,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)',
    },
    searchAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '700',
    },
    resultEmail: {
        fontSize: 12,
        fontWeight: '500',
    },
    addIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 15,
        fontWeight: '500',
    },

});
