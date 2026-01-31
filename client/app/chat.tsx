import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import * as signalR from '@microsoft/signalr';
import { SIGNALR_URL } from '../constants/Config';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import { LinearGradient } from 'expo-linear-gradient';




interface Message {
    id: number;
    senderId: number;
    content: string;
    sentAt: string;
    senderName?: string; // Optional: Display sender name
}

export default function ChatScreen() {
    const { groupId, groupName } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const userId = authService.getUserId();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Fetch previous messages
    useEffect(() => {
        const loadMessages = async () => {
            if (!groupId) return;
            try {
                const prevMessages = await apiService.get(`/Groups/${groupId}/messages`);
                setMessages(prevMessages);
                // Scroll to bottom after loading
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
            } catch (error) {
                console.error('Failed to load messages', error);
            }
        };
        loadMessages();
    }, [groupId]);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(SIGNALR_URL)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to SignalR!');
                    if (groupId) {
                        connection.invoke('JoinGroupChat', groupId.toString());
                    }

                    connection.on('ReceiveMessage', (message: Message) => {
                        setMessages(prev => [...prev, message]);
                        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));

            return () => {
                connection.stop();
            };
        }
    }, [connection, groupId]);

    const sendMessage = async () => {
        if (inputText.trim() === '' || !connection || !userId) return;

        try {
            await connection.invoke('SendMessage',
                parseInt(groupId as string),
                userId,
                inputText
            );
            setInputText('');
        } catch (e) {
            console.log('Send failed: ', e);
        }
    };

    const fetchFriends = async () => {
        try {
            setLoadingFriends(true);
            const data = await apiService.get(`/Friendships/${userId}/list`);
            setFriends(data);
        } catch (error) {
            console.error('Failed to fetch friends', error);
        } finally {
            setLoadingFriends(false);
        }
    };

    const addMemberToGroup = async (memberId: number) => {
        try {
            setAddingMembers(true);
            await apiService.post(`/Groups/${groupId}/add-members`, [memberId]);
            Alert.alert('Başarılı', 'Üye başarıyla eklendi!');
            setShowAddMemberModal(false);
        } catch (error) {
            console.error('Failed to add member', error);
            Alert.alert('Hata', 'Üye eklenirken bir hata oluştu.');
        } finally {
            setAddingMembers(false);
        }
    };

    const openAddMemberModal = () => {
        setShowAddMemberModal(true);
        fetchFriends();
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <Stack.Screen
                options={{
                    title: groupName as string || 'Chat',
                    headerRight: () => (
                        <TouchableOpacity onPress={openAddMemberModal} style={{ marginRight: 15 }}>
                            <Ionicons name="person-add-outline" size={24} color={theme.text} />
                        </TouchableOpacity>
                    )
                }}
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messageList}
                style={styles.messageListContainer}
                inverted={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                    <View style={item.senderId === userId ? styles.myMessageContainer : styles.otherMessageContainer}>
                        {item.senderId !== userId && (
                            <Text style={[styles.senderName, { color: theme.tabIconDefault }]}>
                                {item.senderName || 'Unknown'}
                            </Text>
                        )}
                        {item.senderId === userId ? (
                            <LinearGradient
                                colors={theme.primaryGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.messageBubble, styles.myMessage]}
                            >
                                <Text style={[styles.messageText, { color: 'white' }]}>
                                    {item.content}
                                </Text>
                                <Text style={[styles.timeText, { color: 'rgba(255,255,255,0.7)' }]}>
                                    {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </LinearGradient>
                        ) : (
                            <View style={[styles.messageBubble, styles.otherMessage, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                <Text style={[styles.messageText, { color: theme.text }]}>
                                    {item.content}
                                </Text>
                                <Text style={[styles.timeText, { color: theme.tabIconDefault }]}>
                                    {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        )}
                    </View>

                )}
            />

            <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Bir şeyler yaz..."
                        placeholderTextColor={theme.tabIconDefault}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                </View>
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton} activeOpacity={0.8}>
                    <LinearGradient
                        colors={theme.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                    />
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>

            </View>


            <Modal
                visible={showAddMemberModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddMemberModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Üye Ekle</Text>
                            <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {loadingFriends ? (
                            <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={friends}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.friendItem}
                                        onPress={() => addMemberToGroup(item.id)}
                                        disabled={addingMembers}
                                    >
                                        <Text style={[styles.friendNameText, { color: theme.text }]}>{item.fullName}</Text>
                                        <Ionicons name="add-circle-outline" size={24} color={theme.tint} />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={{ textAlign: 'center', marginTop: 20, color: theme.tabIconDefault }}>
                                        Eklenecek arkadaş bulunamadı.
                                    </Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageListContainer: {
        flex: 1,
    },
    messageList: {
        padding: 20,
        paddingBottom: 20,
        flexGrow: 1,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 22,
        marginBottom: 4,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    myMessage: {
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
        fontWeight: '600',
    },
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 4,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 35 : 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.1)',
        paddingHorizontal: 20,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        fontWeight: '500',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.1)',
    },
    friendNameText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
