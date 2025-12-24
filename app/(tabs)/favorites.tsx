import { ChannelCard } from '@/src/components/ChannelCard';
import { IOSHeader } from '@/src/components/IOSHeader';
import { useChannels } from '@/src/hooks/useChannels';
import { useStore } from '@/src/store/useStore';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Settings, Star } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export default function FavoritesScreen() {
    const { activeSourceUrl, favorites, setActiveChannel } = useStore();
    const { data: channels, isLoading } = useChannels();
    const router = useRouter();

    const favoriteChannels = channels?.filter((channel) => favorites.includes(channel.id)) || [];

    const handleChannelPress = (channel: any) => {
        setActiveChannel(channel);
    };

    if (!activeSourceUrl) {
        return (
            <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
                <IOSHeader title="Favorites" size="small" />
                <View className="flex-1 justify-center items-center p-8">
                    <View className="w-20 h-20 bg-ios-gray/10 rounded-full items-center justify-center mb-6">
                        <Settings size={40} color="#8E8E93" />
                    </View>
                    <Text className="text-xl font-bold dark:text-white text-center mb-2">No Playlist Selected</Text>
                    <Text className="text-ios-gray text-center mb-8">
                        Select a source in Settings to see your favorite channels.
                    </Text>
                    <Pressable
                        onPress={() => router.push('/settings')}
                        className="bg-ios-blue px-8 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold text-base">Select Source</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-ios-background-light dark:bg-ios-background-dark">
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
            <IOSHeader title="Favorites" size="small" />

            {favoriteChannels.length > 0 ? (
                <FlashList
                    data={favoriteChannels}
                    renderItem={({ item, index }) => (
                        <ChannelCard channel={item} onPress={handleChannelPress} viewMode="grid" index={index} />
                    )}
                    keyExtractor={(item) => item.id}
                    // @ts-ignore
                    estimatedItemSize={120}
                    numColumns={3}
                    contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-10">
                    <View className="w-20 h-20 rounded-full bg-ios-gray/10 items-center justify-center mb-4">
                        <Star size={40} color="#8E8E93" />
                    </View>
                    <Text className="text-xl font-bold dark:text-white text-center">No Favorites Yet</Text>
                    <Text className="text-ios-gray text-center mt-2">
                        Long press on a channel to add it to your favorites list for quick access.
                    </Text>
                </View>
            )}
        </View>
    );
}
