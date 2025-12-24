import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';

    // Filter out _sitemap and other internal routes if any
    const visibleRoutes = state.routes.filter(r => !['_sitemap', '+not-found'].includes(r.name));

    return (
        <View
            style={[
                styles.wrapper,
                { bottom: insets.bottom > 0 ? insets.bottom : 20 }
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.container}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.content}>
                    {visibleRoutes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const label = options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        const Icon = options.tabBarIcon;

                        return (
                            <Pressable
                                key={route.key}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={[
                                    styles.tabItem,
                                    isFocused && styles.tabItemActive
                                ]}
                            >
                                <View style={styles.iconWrapper}>
                                    {Icon && Icon({
                                        focused: isFocused,
                                        color: (() => {
                                            const colors: Record<string, string> = {
                                                index: '#2ecc71',
                                                channels: '#e74c3c',
                                                favorites: '#f1c40f',
                                                settings: '#ecf0f1',
                                            };
                                            const baseColor = colors[route.name] || '#8E8E93';
                                            return isFocused ? baseColor : `${baseColor}66`;
                                        })(),
                                        size: 20
                                    })}
                                </View>
                                {isFocused && (
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.label}>
                                            {typeof label === 'string' ? label : ''}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(28, 28, 30, 0.97)',
        borderRadius: 40,
        padding: 6,
        marginHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 30,
        minWidth: 60,
    },
    tabItemActive: {
        backgroundColor: '#007AFF', // iOS Blue
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelWrapper: {
        marginLeft: 8,
    },
    label: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
