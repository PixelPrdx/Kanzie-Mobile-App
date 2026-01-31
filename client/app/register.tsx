import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { apiService } from '../api/apiService';
import { authService } from '../api/authService';

import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';

export default function RegisterScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !fullName) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            setLoading(true);
            const user = await apiService.post('/Users/register', {
                email,
                fullName
            });

            authService.setUser(user);
            router.replace('/login');
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert(`Kayıt başarısız: ${error.message || 'Bir hata oluştu.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <LinearGradient
                        colors={theme.accentGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoContainer}
                    >
                        <Ionicons name="person-add" size={40} color="white" />
                    </LinearGradient>
                    <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
                        Join the Kanzie community and start exploring
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="person-outline" size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Full Name"
                            placeholderTextColor={theme.tabIconDefault}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="mail-outline" size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Email Address"
                            placeholderTextColor={theme.tabIconDefault}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.tabIconDefault} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Password"
                            placeholderTextColor={theme.tabIconDefault}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <GradientButton
                        title="Kayıt Ol"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                        gradient={theme.primaryGradient}
                    />
                </View>


                <View style={styles.footer}>
                    <Text style={{ color: theme.tabIconDefault }}>Already have an account? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text style={{ color: theme.tint, fontWeight: '700' }}>Login</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        paddingVertical: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        transform: [{ rotate: '-10deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        opacity: 0.8,
    },
    form: {
        gap: 15,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    registerButton: {
        marginTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
});

