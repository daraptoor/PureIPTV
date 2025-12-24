import { ChannelCard } from '@/src/components/ChannelCard';
import { IOSHeader } from '@/src/components/IOSHeader';
import { useChannels, useGroupedChannels } from '@/src/hooks/useChannels';
import { useStore } from '@/src/store/useStore';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2) / 3.2; // Shows 3 full cards and a peek of the 4th

export default function WatchNowScreen() {
  const { activeSourceUrl, setActiveChannel, activeChannel } = useStore();
  const { data: channels, isLoading } = useChannels();
  const groupedChannels = useGroupedChannels(channels);
  const router = useRouter();

  const handleChannelPress = (channel: any) => {
    setActiveChannel(channel);
  };

  if (!activeSourceUrl) {
    return (
      <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
        <IOSHeader title="Watch Now" />
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 bg-ios-gray/10 rounded-full items-center justify-center mb-6">
            <Settings size={40} color="#8E8E93" />
          </View>
          <Text className="text-xl font-bold dark:text-white text-center mb-2">No Playlist Selected</Text>
          <Text className="text-ios-gray text-center mb-8">
            Add an M3U playlist in Settings to see featured content and categories.
          </Text>
          <Pressable
            onPress={() => router.push('/settings')}
            className="bg-ios-blue px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-base">Get Started</Text>
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

  // Get first 50 channels for "Featured"
  const featuredChannels = channels?.slice(0, 50) || [];
  const categories = Object.keys(groupedChannels).slice(0, 5);

  return (
    <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
        stickyHeaderIndices={!activeChannel ? [0] : undefined}
      >
        <IOSHeader title="Watch Now" size="small" />
        {featuredChannels.length > 0 && (
          <View className="mt-6">
            <View className="flex-row justify-between items-center px-4 mb-2">
              <Text className="text-xl font-bold dark:text-white">Featured</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH}
            >
              {featuredChannels.map((channel, index) => (
                <View key={channel.id} style={{ width: CARD_WIDTH }}>
                  <ChannelCard channel={channel} onPress={handleChannelPress} viewMode="grid" index={index} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Preview */}
        {categories.map((category) => (
          <View key={category} className="mt-8">
            <View className="flex-row justify-between items-center px-4 mb-2">
              <Text className="text-xl font-bold dark:text-white">{category}</Text>
              <Pressable onPress={() => router.push('/channels')}>
                <Text className="text-ios-blue font-medium">See All</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH}
            >
              {groupedChannels[category].slice(0, 50).map((channel, index) => (
                <View key={channel.id} style={{ width: CARD_WIDTH }}>
                  <ChannelCard channel={channel} onPress={handleChannelPress} viewMode="grid" index={index} />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}

        {featuredChannels.length === 0 && !isLoading && (
          <View className="mt-20 items-center px-10">
            <Text className="text-ios-gray text-center">No channels available from this source.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
