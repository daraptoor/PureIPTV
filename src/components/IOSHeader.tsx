import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

interface IOSHeaderProps {
    title: string;
    rightElement?: React.ReactNode;
    size?: 'default' | 'small';
}

export const IOSHeader = ({ title, rightElement, size = 'default' }: IOSHeaderProps) => {
    const isSmall = size === 'small';
    const insets = useSafeAreaInsets();
    const activeChannel = useStore((state) => state.activeChannel);

    return (
        <View
            style={{ paddingTop: (activeChannel ? 0 : insets.top) + (isSmall ? 8 : 16) }}
            className={`px-5 pb-1 ${isSmall ? 'mt-0 bg-ios-background-light dark:bg-ios-background-dark' : ''} bg-transparent flex-row justify-between items-end`}
        >
            <Text className={`${isSmall ? 'text-2xl' : 'text-4xl'} font-bold tracking-tight text-ios-gray-900 dark:text-white`}>
                {title}
            </Text>
            {rightElement && (
                <View className="mb-1">
                    {rightElement}
                </View>
            )}
        </View>
    );
};
