import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

interface BlurViewWrapperProps {
    children: React.ReactNode;
    intensity?: number;
}

export const BlurViewWrapper = ({ children, intensity = 80 }: BlurViewWrapperProps) => {
    const colorScheme = useColorScheme();

    return (
        <View style={styles.container}>
            <BlurView
                intensity={intensity}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});
