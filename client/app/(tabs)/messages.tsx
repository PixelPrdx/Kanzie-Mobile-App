import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { apiService } from '../../api/apiService';
import { authService } from '../../api/authService';
import { LinearGradient } from 'expo-linear-gradient';


interface InboxItem {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
    unread: boolean;
}

export default function MessagesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [messages, setMessages] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInbox = async () => {
        try {
            const userId = authService.getUserId();
            if (userId === 0) {
                router.replace('/login');
                return;
            }
            const data = await apiService.get(`/Users/${userId}/inbox`);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInbox();
    }, []);

    const renderItem = ({ item }: { item: InboxItem }) => (
        <TouchableOpacity
            style={[styles.chatItem, { backgroundColor: item.unread ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }]}
            onPress={() => router.push({ pathname: '/chat', params: { groupId: item.id, groupName: item.name } })}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.unread && <View style={[styles.onlineIndicator, { backgroundColor: theme.tint }]} />}
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.topRow}>
                    <Text style={[styles.name, { color: theme.text, fontWeight: item.unread ? '800' : '600' }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.time, { color: theme.tabIconDefault }]}>{item.time}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text
                        numberOfLines={1}
                        style={[styles.lastMessage, { color: item.unread ? theme.text : theme.tabIconDefault, fontWeight: item.unread ? '600' : '500' }]}
                    >
                        {item.lastMessage}
                    </Text>
                    {item.unread && (
                        <LinearGradient
                            colors={theme.primaryGradient}
                            style={styles.unreadBadge}
                        >
                            <Text style={styles.unreadCount}>1</Text>
                        </LinearGradient>
                    )}
                </View>
            </View>
        </TouchableOpacity>

    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/create-group')}>
                        <Ionicons name="add" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={fetchInbox}>
                        <Ionicons name="refresh" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
                                Henüz bir mesajın yok.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 110, // Clear absolute tab bar
    },

    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: 'white',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 17,
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    unreadBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadCount: {
        color: 'white',
        fontSize: 11,
        fontWeight: '800',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
