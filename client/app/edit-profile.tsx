import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { SERVER_URL } from '../constants/Config';
import { useColorScheme } from '../components/useColorScheme';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';


export default function EditProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = authService.getUserId();
            if (userId === 0) {
                router.replace('/login');
                return;
            }
            const user = await apiService.get(`/Users/${userId}`);
            setFullName(user.fullName);
            setBio(user.bio || '');
            setAvatarUrl(user.avatarUrl || '');
        } catch (error) {
            console.error('Failed to fetch profile for editing:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatarUrl(result.assets[0].uri);
            }
        } catch (error) {
            alert('Galeri açılırken bir hata oluştu.');
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            alert('Lütfen adınızı girin.');
            return;
        }

        try {
            setSaving(true);
            const userId = authService.getUserId();

            let finalAvatarUrl = avatarUrl;

            // If it's a local file (from image picker), upload it first
            if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
                const uploadResult = await apiService.upload('/Media/upload', avatarUrl);
                finalAvatarUrl = uploadResult.url;
            }

            // Use POST based on our fix for 405 error
            await apiService.post(`/Users/update/${userId}`, { fullName, bio, avatarUrl: finalAvatarUrl });

            // Update local auth session as well
            const currentUser = authService.getUser();
            if (currentUser) {
                authService.setUser({ ...currentUser, fullName, avatarUrl: finalAvatarUrl });
            }

            alert('Profil başarıyla güncellendi!');
            router.back();
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            alert(`Güncelleme başarısız: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <Stack.Screen options={{
                headerShown: true,
                title: 'Profili Düzenle',
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="close" size={28} color={theme.text} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} disabled={saving} style={{ marginRight: 10 }}>
                        {saving ? (
                            <ActivityIndicator size="small" color={theme.tint} />
                        ) : (
                            <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Kaydet</Text>
                        )}
                    </TouchableOpacity>
                )
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.8}>
                        <LinearGradient
                            colors={theme.primaryGradient as any}
                            style={styles.avatarGradient}
                        >

                            <View style={styles.avatarWrapper}>
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl.startsWith('/') ? `${SERVER_URL}${avatarUrl}` : avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card }]}>
                                        <Ionicons name="person" size={50} color={theme.tabIconDefault} />
                                    </View>
                                )}
                                <View style={styles.cameraBadge}>
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={[styles.changePhotoText, { color: theme.tint }]}>Fotoğrafı Güncelle</Text>
                </View>


                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.tabIconDefault }]}>AD SOYAD</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Adınız Soyadınız"
                            placeholderTextColor={theme.tabIconDefault}
                        />
                    </View>


                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.tabIconDefault }]}>BİYOGRAFİ</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Kendinden bahset..."
                            placeholderTextColor={theme.tabIconDefault}
                            multiline
                            numberOfLines={4}
                        />

                    </View>
                </View>

                <GradientButton
                    title={saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                />

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 25,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 35,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
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
    avatarWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 66,
        backgroundColor: 'white',
        padding: 2,
        position: 'relative',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 64,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    changePhotoText: {
        marginTop: 15,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    form: {
        gap: 25,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginLeft: 4,
    },
    input: {
        height: 55,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
    },

    textArea: {
        height: 120,
        paddingTop: 15,
        textAlignVertical: 'top',
    },
    saveButton: {
        height: 55,
        borderRadius: 15,
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
                elevation: 4,
            },
        }),
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
