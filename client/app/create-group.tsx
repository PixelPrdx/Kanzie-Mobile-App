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
    Platform,
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


interface Friend {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
}

export default function CreateGroupScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const userId = authService.getUserId();
            if (!userId) return;
            // Only fetch accepted friends
            const friendsData = await apiService.get(`/Friendships/${userId}/list`);
            setFriends(friendsData);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (friendId: number) => {
        if (selectedFriendIds.includes(friendId)) {
            setSelectedFriendIds(prev => prev.filter(id => id !== friendId));
        } else {
            setSelectedFriendIds(prev => [...prev, friendId]);
        }
    };

    const handleCreateGroup = async () => {
        console.log('handleCreateGroup called');
        console.log('groupName:', groupName);
        console.log('selectedFriendIds:', selectedFriendIds);

        if (!groupName.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir grup adı girin.');
            return;
        }

        try {
            setCreating(true);
            const userId = authService.getUserId();
            console.log('userId:', userId);

            const payload = {
                name: groupName,
                creatorUserId: userId,
                memberIds: selectedFriendIds
            };
            console.log('payload:', JSON.stringify(payload));

            const result = await apiService.post('/Groups/create', payload);
            console.log('API result:', result);

            Alert.alert('Başarılı', 'Grup oluşturuldu!');
            router.back(); // Go back to Messages screen
            // Ideally we should navigate to the chat directly or refresh messages list
        } catch (error) {
            console.error('Create group error:', error);
            Alert.alert('Hata', 'Grup oluşturulamadı.');
        } finally {
            setCreating(false);
        }
    };

    const renderFriendItem = ({ item }: { item: Friend }) => {
        const isSelected = selectedFriendIds.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => toggleSelection(item.id)}
                activeOpacity={0.8}
            >
                <GlassView intensity={isSelected ? 60 : 20} style={StyleSheet.flatten([styles.friendItem, isSelected && { borderColor: theme.tint, borderWidth: 1 }]) as any}>



                    <Image
                        source={{ uri: item.avatarUrl ? `${SERVER_URL}${item.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=random&size=100` }}
                        style={styles.avatar}
                    />
                    <View style={styles.friendInfo}>
                        <Text style={[styles.friendName, { color: theme.text }]}>{item.fullName}</Text>
                        <Text style={[styles.friendEmail, { color: theme.tabIconDefault }]}>{item.email}</Text>
                    </View>
                    <View style={[styles.checkbox, { borderColor: theme.tint, backgroundColor: isSelected ? theme.tint : 'transparent' }]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                </GlassView>
            </TouchableOpacity>
        );
    };


    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Yeni Grup</Text>
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.text }]}>Grup Adı</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="people" size={20} color={theme.tabIconDefault} style={{ marginRight: 12 }} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Örn: Hafta Sonu Planı"
                        placeholderTextColor={theme.tabIconDefault}
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                </View>
            </View>


            <Text style={[styles.label, { color: theme.text, marginTop: 20, marginBottom: 10 }]}>Arkadaşlarını Ekle ({selectedFriendIds.length})</Text>

            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} />
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFriendItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>Listenizde arkadaş bulunamadı. Önce arkadaş ekleyin.</Text>
                    }
                />
            )}

            <GradientButton
                title={creating ? 'Grup Oluşturuluyor...' : 'Grup Oluştur'}
                onPress={handleCreateGroup}
                loading={creating}
                style={styles.createButton}
            />

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
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingHorizontal: 18,
        height: 56,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingBottom: 100,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
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
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    }
});
