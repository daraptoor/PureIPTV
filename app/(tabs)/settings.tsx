import { IOSHeader } from '@/src/components/IOSHeader';
import { useChannels } from '@/src/hooks/useChannels';
import { useStore } from '@/src/store/useStore';
import { BlurView } from 'expo-blur';
import { ChevronRight, Globe, Monitor, Music, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

const PRESET_SOURCES = [
    { name: 'US TV', url: 'https://iptv-org.github.io/iptv/countries/us.m3u', epg: '' },
    { name: 'India (Hindi)', url: 'https://iptv-org.github.io/iptv/languages/hin.m3u', epg: '' },
    { name: 'UK TV', url: 'https://iptv-org.github.io/iptv/countries/uk.m3u', epg: '' },
    { name: 'Sports', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u', epg: '' },
    { name: 'Movies', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u', epg: '' },
    { name: 'News', url: 'https://iptv-org.github.io/iptv/categories/news.m3u', epg: '' },
    { name: 'Music', url: 'https://iptv-org.github.io/iptv/categories/music.m3u', epg: '' },
];

export default function SettingsScreen() {
    const {
        sources,
        addSource,
        updateSource,
        removeSource,
        setActiveSource,
        activeSourceUrl,
        backgroundAudioEnabled,
        setBackgroundAudioEnabled,
        pipEnabled,
        setPipEnabled
    } = useStore();
    const { refetch, isRefetching } = useChannels();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSourceUrl, setEditingSourceUrl] = useState<string | null>(null);
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [newSourceEpgUrl, setNewSourceEpgUrl] = useState('');

    const handleOpenEdit = (source: any) => {
        setEditingSourceUrl(source.url);
        setNewSourceName(source.name);
        setNewSourceUrl(source.url);
        setNewSourceEpgUrl(source.epgUrl || '');
        setModalVisible(true);
    };

    const handleOpenAdd = () => {
        setEditingSourceUrl(null);
        setNewSourceName('');
        setNewSourceUrl('');
        setNewSourceEpgUrl('');
        setModalVisible(true);
    };

    const handleSaveSource = () => {
        if (!newSourceName || !newSourceUrl) {
            Alert.alert('Error', 'Please enter both name and URL');
            return;
        }

        const sourceData = {
            name: newSourceName,
            url: newSourceUrl,
            epgUrl: newSourceEpgUrl || undefined
        };

        if (editingSourceUrl) {
            updateSource(editingSourceUrl, sourceData);
        } else {
            addSource(sourceData);
        }

        setModalVisible(false);
        setNewSourceName('');
        setNewSourceUrl('');
        setNewSourceEpgUrl('');
        setEditingSourceUrl(null);
    };

    const confirmDelete = (url: string) => {
        Alert.alert(
            'Delete Source',
            'Are you sure you want to remove this source?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeSource(url) },
            ]
        );
    };

    return (
        <View className="flex-1 bg-ios-background-light dark:bg-ios-background-dark">
            <ScrollView className="flex-1 px-4 mt-2" contentContainerStyle={{ paddingBottom: 100 }}>
                <IOSHeader title="Settings" size="small" />
                <Text className="text-xs font-semibold text-ios-gray uppercase mt-4 mb-2 ml-4">
                    Manage Sources
                </Text>

                <View className="bg-white dark:bg-ios-card-dark rounded-xl overflow-hidden shadow-sm">
                    {sources.map((source, index) => (
                        <View key={source.url}>
                            <Pressable
                                onPress={() => setActiveSource(source.url)}
                                className={`flex-row items-center p-4 ${activeSourceUrl === source.url ? 'bg-ios-blue/5' : ''
                                    }`}
                            >
                                <View className="w-8 h-8 rounded-full bg-ios-blue/10 items-center justify-center mr-3">
                                    <Globe size={18} color="#007AFF" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold dark:text-white">{source.name}</Text>
                                    <Text className="text-xs text-ios-gray truncate" numberOfLines={1}>
                                        M3U: {source.url}
                                    </Text>
                                    {source.epgUrl && (
                                        <Text className="text-[10px] text-ios-gray truncate mt-0.5" numberOfLines={1}>
                                            EPG: {source.epgUrl}
                                        </Text>
                                    )}
                                </View>
                                {activeSourceUrl === source.url && (
                                    <View className="bg-ios-blue rounded-full px-2 py-0.5 mr-2">
                                        <Text className="text-[10px] text-white font-bold">ACTIVE</Text>
                                    </View>
                                )}
                                <Pressable onPress={() => handleOpenEdit(source)} className="p-2">
                                    <Pencil size={18} color="#8E8E93" />
                                </Pressable>
                                <Pressable onPress={() => confirmDelete(source.url)} className="p-2">
                                    <Trash2 size={18} color="#FF3B30" />
                                </Pressable>
                            </Pressable>
                            {index < sources.length - 1 && (
                                <View className="h-[0.5px] bg-ios-gray/20 ml-15" />
                            )}
                        </View>
                    ))}

                    <Pressable
                        onPress={handleOpenAdd}
                        className="flex-row items-center p-4 border-t border-ios-gray/10"
                    >
                        <View className="w-8 h-8 rounded-full bg-green-500/10 items-center justify-center mr-3">
                            <Plus size={18} color="#34C759" />
                        </View>
                        <Text className="text-base text-green-600 font-medium">Add New Source</Text>
                        <View className="flex-1" />
                        <ChevronRight size={18} color="#C7C7CC" />
                    </Pressable>
                </View>

                <Text className="text-xs font-semibold text-ios-gray uppercase mt-8 mb-2 ml-4">
                    Player Preferences
                </Text>
                <View className="bg-white dark:bg-ios-card-dark rounded-xl overflow-hidden shadow-sm">
                    <View className="flex-row items-center p-4">
                        <View className="w-8 h-8 rounded-full bg-purple-500/10 items-center justify-center mr-3">
                            <Music size={18} color="#AF52DE" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold dark:text-white">Background Audio</Text>
                            <Text className="text-xs text-ios-gray">Continue playing audio in background</Text>
                        </View>
                        <Switch
                            value={backgroundAudioEnabled}
                            onValueChange={setBackgroundAudioEnabled}
                            trackColor={{ false: '#767577', true: '#34C759' }}
                            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : backgroundAudioEnabled ? '#FFFFFF' : '#f4f3f4'}
                        />
                    </View>
                    <View className="h-[0.5px] bg-ios-gray/20 ml-15" />
                    <View className="flex-row items-center p-4">
                        <View className="w-8 h-8 rounded-full bg-ios-blue/10 items-center justify-center mr-3">
                            <Monitor size={18} color="#007AFF" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold dark:text-white">Picture-in-Picture</Text>
                            <Text className="text-xs text-ios-gray">Allow video to play in a floating window</Text>
                        </View>
                        <Switch
                            value={pipEnabled}
                            onValueChange={setPipEnabled}
                            trackColor={{ false: '#767577', true: '#34C759' }}
                            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : pipEnabled ? '#FFFFFF' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <Text className="text-xs font-semibold text-ios-gray uppercase mt-8 mb-2 ml-4">
                    Content Refresh
                </Text>
                <View className="bg-white dark:bg-ios-card-dark rounded-xl overflow-hidden shadow-sm">
                    <Pressable
                        onPress={() => refetch()}
                        disabled={isRefetching || !activeSourceUrl}
                        className={`flex-row items-center p-4 ${isRefetching ? 'opacity-50' : ''}`}
                    >
                        <View className="w-8 h-8 rounded-full bg-ios-blue/10 items-center justify-center mr-3">
                            {isRefetching ? (
                                <ActivityIndicator size="small" color="#007AFF" />
                            ) : (
                                <RefreshCcw size={18} color="#007AFF" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold dark:text-white">
                                {isRefetching ? 'Refreshing...' : 'Refresh Active Source'}
                            </Text>
                            <Text className="text-xs text-ios-gray">
                                Force reload channels from the current playlist
                            </Text>
                        </View>
                        {!isRefetching && <ChevronRight size={18} color="#C7C7CC" />}
                    </Pressable>
                </View>

                <View className="mt-8 bg-white dark:bg-ios-card-dark rounded-xl overflow-hidden p-4">
                    <Text className="text-ios-gray text-xs text-center">
                        PureIPTV v1.0.1
                    </Text>
                </View>
            </ScrollView>

            {/* iOS Style Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View className="flex-1 justify-end">
                        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
                            <Pressable onPress={() => setModalVisible(false)} className="flex-1" />
                        </BlurView>

                        <View className="bg-ios-background-light dark:bg-ios-card-dark rounded-t-3xl p-6 min-h-[400px]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Pressable onPress={() => setModalVisible(false)}>
                                    <Text className="text-ios-blue text-lg">Cancel</Text>
                                </Pressable>
                                <Text className="text-lg font-bold dark:text-white">
                                    {editingSourceUrl ? 'Edit Source' : 'Add Source'}
                                </Text>
                                <Pressable onPress={handleSaveSource}>
                                    <Text className="text-ios-blue text-lg font-bold">
                                        {editingSourceUrl ? 'Save' : 'Add'}
                                    </Text>
                                </Pressable>
                            </View>

                            <View className="space-y-4">
                                {/* Quick Pick Chips (Only in Add Mode) */}
                                {!editingSourceUrl && (
                                    <View>
                                        <Text className="text-xs text-ios-gray mb-2 ml-1">QUICK PICK</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                            {PRESET_SOURCES.map((preset) => (
                                                <Pressable
                                                    key={preset.name}
                                                    onPress={() => {
                                                        setNewSourceName(preset.name);
                                                        setNewSourceUrl(preset.url);
                                                        setNewSourceEpgUrl(preset.epg);
                                                    }}
                                                    className="bg-ios-blue/10 rounded-full px-4 py-2 mr-2 border border-ios-blue/20"
                                                >
                                                    <Text className="text-ios-blue font-semibold text-xs">{preset.name}</Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View className="bg-white dark:bg-black/20 rounded-xl p-4 border border-ios-gray/10">
                                    <Text className="text-xs text-ios-gray mb-1">SOURCE NAME</Text>
                                    <TextInput
                                        value={newSourceName}
                                        onChangeText={setNewSourceName}
                                        placeholder="e.g. My Favorite List"
                                        className="text-base dark:text-white"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>

                                <View className="bg-white dark:bg-black/20 rounded-xl p-4 border border-ios-gray/10">
                                    <Text className="text-xs text-ios-gray mb-1">M3U URL</Text>
                                    <TextInput
                                        value={newSourceUrl}
                                        onChangeText={setNewSourceUrl}
                                        placeholder="https://example.com/list.m3u"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        className="text-base dark:text-white"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>

                                <View className="bg-white dark:bg-black/20 rounded-xl p-4 border border-ios-gray/10">
                                    <Text className="text-xs text-ios-gray mb-1">EPG URL (XMLTV) - Optional</Text>
                                    <TextInput
                                        value={newSourceEpgUrl}
                                        onChangeText={setNewSourceEpgUrl}
                                        placeholder="https://example.com/epg.xml"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        className="text-base dark:text-white"
                                        placeholderTextColor="#8E8E93"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
