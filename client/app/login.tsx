import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';

import { apiService } from '../api/apiService';
import { authService } from '../api/authService';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email) {
            alert('Lütfen e-posta adresinizi girin.');
            return;
        }

        try {
            setLoading(true);
            const user = await apiService.post('/Users/login', { email });
            authService.setUser(user);
            if (user.isOnboardingCompleted) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Giriş başarısız. Lütfen e-posta adresinizi kontrol edin veya kayıt olun.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <LinearGradient
                        colors={theme.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoContainer}
                    >
                        <Ionicons name="sparkles" size={40} color="white" />
                    </LinearGradient>
                    <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
                        Login to continue your Kanzie adventure
                    </Text>
                </View>

                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={{ color: theme.tint, fontWeight: '600' }}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <GradientButton
                        title="Giriş Yap"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={{ color: theme.tabIconDefault }}>Don't have an account? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={{ color: theme.tint, fontWeight: '700' }}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        transform: [{ rotate: '15deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#8b5cf6',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    loginButton: {
        marginTop: 10,
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

