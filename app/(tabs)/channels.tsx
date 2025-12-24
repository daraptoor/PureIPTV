import { ChannelCard } from '@/src/components/ChannelCard';
import { IOSHeader } from '@/src/components/IOSHeader';
import { useChannels } from '@/src/hooks/useChannels';
import { useStore } from '@/src/store/useStore';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Filter, LayoutGrid, List, Search, Settings, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';

export default function ChannelsScreen() {
    const activeSourceUrl = useStore((state) => state.activeSourceUrl);
    const setActiveChannel = useStore((state) => state.setActiveChannel);

    const { data: channels, isLoading, error } = useChannels();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [controlsVisible, setControlsVisible] = useState(false);

    const router = useRouter();
    const colorScheme = useColorScheme();

    // Toggle controls with animation
    const toggleControls = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setControlsVisible(!controlsVisible);
    };

    // Search debouncing
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 150);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Extract unique categories - Optimized single pass
    const categories = useMemo(() => {
        if (!channels) return [];
        const set = new Set<string>();
        for (let i = 0; i < channels.length; i++) {
            set.add(channels[i].group || 'General');
        }
        return Array.from(set).sort();
    }, [channels]);

    const filteredChannels = useMemo(() => {
        if (!channels || !activeSourceUrl) return [];
        const query = debouncedSearchQuery.toLowerCase();
        return channels.filter((channel) => {
            const matchesSearch = !query ||
                channel.name.toLowerCase().includes(query) ||
                channel.group.toLowerCase().includes(query);

            const matchesCategory =
                !selectedCategory || (channel.group || 'General') === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [channels, debouncedSearchQuery, selectedCategory, activeSourceUrl]);

    const HeaderControls = useMemo(() => (
        <View className="flex-row items-center space-x-1">
            {controlsVisible && (
                <>
                    <Pressable
                        onPress={() => setViewMode('grid')}
                        className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-ios-blue/10' : 'bg-transparent'}`}
                    >
                        <LayoutGrid size={20} color={viewMode === 'grid' ? "#007AFF" : "#8E8E93"} />
                    </Pressable>
                    <Pressable
                        onPress={() => setViewMode('list')}
                        className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-ios-blue/10' : 'bg-transparent'}`}
                    >
                        <List size={20} color={viewMode === 'list' ? "#007AFF" : "#8E8E93"} />
                    </Pressable>
                    <Pressable
                        onPress={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full ${showFilters || selectedCategory ? 'bg-ios-blue/10' : 'bg-transparent'}`}
                    >
                        <Filter size={20} color={showFilters || selectedCategory ? "#007AFF" : "#8E8E93"} />
                    </Pressable>
                </>
            )}
            <Pressable
                onPress={toggleControls}
                className={`p-2 rounded-full ${controlsVisible ? 'bg-ios-blue/10' : 'bg-transparent'}`}
            >
                {controlsVisible ? (
                    <EyeOff size={20} color="#007AFF" />
                ) : (
                    <Eye size={20} color="#8E8E93" />
                )}
            </Pressable>
        </View>
    ), [viewMode, showFilters, selectedCategory, controlsVisible]);

    const handleChannelPress = (channel: any) => {
        setActiveChannel(channel);
    };

    if (!activeSourceUrl) {
        return (
            <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
                <IOSHeader title="Channels" size="small" />
                <View className="flex-1 justify-center items-center p-8">
                    <View className="w-20 h-20 bg-ios-gray/10 rounded-full items-center justify-center mb-6">
                        <Settings size={40} color="#8E8E93" />
                    </View>
                    <Text className="text-xl font-bold dark:text-white text-center mb-2">No Source Active</Text>
                    <Text className="text-ios-gray text-center mb-8">
                        Please add or select a playlist in Settings to start watching.
                    </Text>
                    <Pressable
                        onPress={() => router.push('/settings')}
                        className="bg-ios-blue px-8 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold text-base">Go to Settings</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-ios-background-light dark:bg-ios-background-dark">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-4 text-ios-gray">Loading channels...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-ios-background-light dark:bg-ios-background-dark">
                <Text className="text-red-500 text-center font-semibold text-lg">Failed to load channels</Text>
                <Text className="text-ios-gray text-center mt-2">Please check your source URL in settings.</Text>
                <Pressable
                    onPress={() => router.push('/settings')}
                    className="mt-6 border border-ios-blue px-6 py-2 rounded-full"
                >
                    <Text className="text-ios-blue font-bold">Check Settings</Text>
                </Pressable>
            </View>
        );
    }



    return (
        <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
            <IOSHeader title="Channels" rightElement={HeaderControls} size="small" />

            {/* Filter Categories Horizontal List */}
            {controlsVisible && showFilters && (
                <View className="py-2">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        <Pressable
                            onPress={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full mr-2 ${!selectedCategory ? 'bg-ios-blue' : 'bg-ios-gray/10'}`}
                        >
                            <Text className={`text-sm font-semibold ${!selectedCategory ? 'text-white' : 'text-ios-gray dark:text-ios-gray-400'}`}>
                                All
                            </Text>
                        </Pressable>
                        {categories.map((category) => (
                            <Pressable
                                key={category}
                                onPress={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === category ? 'bg-ios-blue' : 'bg-ios-gray/10'}`}
                            >
                                <Text className={`text-sm font-semibold ${selectedCategory === category ? 'text-white' : 'text-ios-gray dark:text-ios-gray-400'}`}>
                                    {category}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Search Bar */}
            {controlsVisible && (
                <View className="px-4 pb-1 mt-0">
                    <View className="flex-row items-center bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2">
                        <Search size={18} color="#8E8E93" />
                        <TextInput
                            placeholder="Search channels..."
                            placeholderTextColor="#8E8E93"
                            className="flex-1 ml-2 text-sm dark:text-white"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ paddingVertical: 2 }}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <X size={18} color="#8E8E93" />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            <FlashList
                data={filteredChannels}
                renderItem={({ item, index }) => (
                    <ChannelCard channel={item} onPress={handleChannelPress} viewMode={viewMode} index={index} />
                )}
                keyExtractor={(item) => item.id}
                // @ts-ignore
                estimatedItemSize={viewMode === 'grid' ? 130 : 80}
                numColumns={viewMode === 'grid' ? 3 : 1}
                key={viewMode} // Force re-render when changing view modes
                contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120 }}
                ListEmptyComponent={() => (
                    <View className="mt-20 items-center">
                        <Text className="text-ios-gray">No channels found</Text>
                    </View>
                )}
            />
        </View>
    );
}
