import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { Channel } from '../utils/m3uParser';

interface ChannelCardProps {
    channel: Channel;
    onPress: (channel: Channel) => void;
    viewMode: 'grid' | 'list';
    index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChannelCardComponent = ({ channel, onPress, viewMode, index }: ChannelCardProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    // Optimization: Select only what we need
    const toggleFavorite = useStore((state) => state.toggleFavorite);
    const favorite = useStore((state) => state.favorites.includes(channel.id));

    // Staggered entrance animation
    useEffect(() => {
        opacity.value = withDelay(index * 50, withTiming(1, { duration: 500 }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(channel);
    };

    const handleLongPress = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toggleFavorite(channel.id);
    };

    // Gradient colors based on theme
    const gradientColors = isDark
        ? ['#2C3E50', '#34495E'] as const
        : ['#ffffff', '#f2f2f7'] as const;

    if (viewMode === 'list') {
        return (
            <AnimatedPressable
                onPress={handlePress}
                onLongPress={handleLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.listContainer, animatedStyle]}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.listGradient}
                >
                    <View style={styles.listContent}>
                        <View style={styles.logoContainerList}>
                            {channel.logo ? (
                                <Image
                                    source={{ uri: channel.logo }}
                                    style={styles.logoList}
                                    contentFit="contain"
                                    transition={200}
                                    cachePolicy="disk"
                                    recyclingKey={channel.id}
                                />
                            ) : (
                                <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>
                                    {channel.name.slice(0, 2).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <View style={styles.textContainerList}>
                            <Text style={[styles.nameList, isDark && styles.nameDark]} numberOfLines={1}>
                                {channel.name}
                            </Text>
                            <Text style={styles.groupList} numberOfLines={1}>
                                {channel.group}
                            </Text>
                        </View>
                        {favorite && (
                            <View style={{ marginLeft: 'auto', paddingRight: 10 }}>
                                <Text style={styles.favoriteStarText}>★</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, animatedStyle]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                {favorite && (
                    <View style={styles.favoriteStarGrid}>
                        <Text style={styles.favoriteStarText}>★</Text>
                    </View>
                )}
                <View style={styles.logoContainer}>
                    {channel.logo ? (
                        <Image
                            source={{ uri: channel.logo }}
                            style={styles.logo}
                            contentFit="contain"
                            transition={200}
                            cachePolicy="disk"
                            recyclingKey={channel.id}
                        />
                    ) : (
                        <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>
                            {channel.name.slice(0, 2).toUpperCase()}
                        </Text>
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, isDark && styles.nameDark]} numberOfLines={1}>
                        {channel.name}
                    </Text>
                </View>
            </LinearGradient>
        </AnimatedPressable>
    );
};

export const ChannelCard = memo(ChannelCardComponent);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 4,
        aspectRatio: 1.35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardGradient: {
        flex: 1,
        borderRadius: 12,
        padding: 6,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(128,128,128, 0.1)'
    },
    listContainer: {
        marginBottom: 8,
        marginHorizontal: 4,
        height: 70,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    listGradient: {
        flex: 1,
        borderRadius: 12,
        padding: 10,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(128,128,128, 0.1)'
    },
    listContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    logoContainerList: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        marginRight: 12,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    logoList: {
        width: '80%',
        height: '80%',
    },
    infoContainer: {
        marginTop: 4,
    },
    textContainerList: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    nameList: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    nameDark: {
        color: '#fff',
    },
    groupList: {
        fontSize: 12,
        color: '#8E8E93',
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ccc',
    },
    placeholderTextDark: {
        color: '#555',
    },
    favoriteStarGrid: {
        position: 'absolute',
        top: 6,
        right: 8,
        zIndex: 10,
    },
    favoriteStarText: {
        color: '#FFD60A',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
