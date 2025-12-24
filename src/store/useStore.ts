import AsyncStorage from '@react-native-async-storage/async-storage';
import { createVideoPlayer, VideoPlayer } from 'expo-video';
import { Image } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Channel } from '../utils/m3uParser';

export interface Source {
    name: string;
    url: string;
    epgUrl?: string;
}

interface AppState {
    sources: Source[];
    activeSourceUrl: string | null;
    activeChannel: Channel | null;
    favorites: string[];
    sharedPlayer: VideoPlayer;
    backgroundAudioEnabled: boolean;
    pipEnabled: boolean;
    addSource: (source: Source) => void;
    updateSource: (oldUrl: string, newSource: Source) => void;
    removeSource: (url: string) => void;
    setActiveSource: (url: string) => void;
    setActiveChannel: (channel: Channel | null) => void;
    toggleFavorite: (channelId: string) => void;
    isFavorite: (channelId: string) => boolean;
    setBackgroundAudioEnabled: (enabled: boolean) => void;
    setPipEnabled: (enabled: boolean) => void;
}

const DEFAULT_SOURCES: Source[] = [
    {
        name: 'India Hindi',
        url: 'https://iptv-org.github.io/iptv/languages/hin.m3u',
        epgUrl: '' // Keeping existing EPG for Hindi
    },
    {
        name: 'United States',
        url: 'https://iptv-org.github.io/iptv/countries/us.m3u',
        epgUrl: '' // No EPG provided for US yet
    }
];

// Initialize the shared player outside the store to have it ready
const sharedPlayer = createVideoPlayer('');
sharedPlayer.staysActiveInBackground = true;

const APP_ICON_URI = Image.resolveAssetSource(require('../../assets/images/icon.png')).uri;

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            sources: DEFAULT_SOURCES,
            activeSourceUrl: DEFAULT_SOURCES[0].url,
            activeChannel: null,
            favorites: [],
            sharedPlayer: sharedPlayer,
            backgroundAudioEnabled: true,
            pipEnabled: true,
            addSource: (source) =>
                set((state) => ({
                    sources: [...state.sources, source],
                    activeSourceUrl: source.url, // Automatically switch to the new source
                })),
            updateSource: (oldUrl, newSource) =>
                set((state) => {
                    const newSources = state.sources.map((s) =>
                        s.url === oldUrl ? newSource : s
                    );
                    const newActiveUrl = state.activeSourceUrl === oldUrl
                        ? newSource.url
                        : state.activeSourceUrl;
                    return {
                        sources: newSources,
                        activeSourceUrl: newActiveUrl,
                    };
                }),
            removeSource: (url) =>
                set((state) => {
                    const remainingSources = state.sources.filter((s) => s.url !== url);
                    const newActiveUrl = state.activeSourceUrl === url
                        ? (remainingSources[0]?.url || null)
                        : state.activeSourceUrl;

                    return {
                        sources: remainingSources,
                        activeSourceUrl: newActiveUrl,
                    };
                }),
            setActiveSource: (url) => set({ activeSourceUrl: url }),
            setActiveChannel: async (channel) => {
                if (channel) {
                    await sharedPlayer.replaceAsync({
                        uri: channel.url,
                        metadata: {
                            title: channel.name,
                            artist: 'PureIPTV',
                            artwork: APP_ICON_URI,
                        }
                    });
                    sharedPlayer.play();
                } else {
                    sharedPlayer.pause();
                }
                set({ activeChannel: channel });
            },
            toggleFavorite: (channelId) =>
                set((state) => ({
                    favorites: state.favorites.includes(channelId)
                        ? state.favorites.filter((id) => id !== channelId)
                        : [...state.favorites, channelId],
                })),
            isFavorite: (channelId) => get().favorites.includes(channelId),
            setBackgroundAudioEnabled: (enabled) => {
                sharedPlayer.staysActiveInBackground = enabled;
                set({ backgroundAudioEnabled: enabled });
            },
            setPipEnabled: (enabled) => set({ pipEnabled: enabled }),
        }),
        {
            name: 'iptv-app-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                sources: state.sources,
                activeSourceUrl: state.activeSourceUrl,
                favorites: state.favorites,
                backgroundAudioEnabled: state.backgroundAudioEnabled,
                pipEnabled: state.pipEnabled,
            }),
            onRehydrateStorage: () => (state) => {
                // Ensure sharedPlayer respects the persisted setting on load
                if (state) {
                    sharedPlayer.staysActiveInBackground = state.backgroundAudioEnabled;
                }
            },
        }
    )
);
