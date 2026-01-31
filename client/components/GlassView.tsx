import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    borderRadius?: number;
}

export default function GlassView({
    children,
    style,
    intensity = 50,
    tint,
    borderRadius = 24
}: GlassViewProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const activeTint = tint || (colorScheme === 'dark' ? 'dark' : 'light');

    if (Platform.OS === 'web') {
        return (
            <View style={[
                styles.webGlass,
                {
                    backgroundColor: theme.glass,
                    borderRadius: borderRadius
                },
                style
            ]}>
                {children}
            </View>
        );
    }

    return (
        <BlurView
            intensity={intensity}
            tint={activeTint}
            style={[
                styles.container,
                { borderRadius: borderRadius },
                style
            ]}
        >
            {children}
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    webGlass: {
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
    }
});
