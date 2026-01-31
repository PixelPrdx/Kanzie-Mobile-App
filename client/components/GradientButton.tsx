import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    gradient?: readonly string[];
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}


export default function GradientButton({
    title,
    onPress,
    style,
    textStyle,
    gradient,
    loading,
    disabled,
    icon
}: GradientButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const activeGradient = gradient || theme.primaryGradient;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={StyleSheet.flatten([styles.button, style, (disabled || loading) && { opacity: 0.7 }]) as any}
        >
            <LinearGradient
                colors={activeGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >

                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        {icon && icon}
                        <Text style={[styles.text, textStyle]}>{title}</Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 18,
        overflow: 'hidden',
        height: 60,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 10,
    },
    text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
