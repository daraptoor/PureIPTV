import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { Channel, parseM3U } from '../utils/m3uParser';

export const useChannels = () => {
    const activeSourceUrl = useStore((state) => state.activeSourceUrl);

    return useQuery({
        queryKey: ['channels', activeSourceUrl],
        queryFn: async () => {
            if (!activeSourceUrl) return [];
            try {
                const response = await fetch(activeSourceUrl);
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const text = await response.text();
                return parseM3U(text);
            } catch (err) {
                console.error('[useChannels] Fetch error:', err);
                throw err;
            }
        },
        enabled: !!activeSourceUrl,
        staleTime: 1000 * 60 * 60, // 1 hour caching
    });
};

export const useGroupedChannels = (channels: Channel[] | undefined) => {
    if (!channels) return {};
    return channels.reduce((acc, channel) => {
        const group = channel.group || 'Uncategorized';
        if (!acc[group]) acc[group] = [];
        acc[group].push(channel);
        return acc;
    }, {} as Record<string, Channel[]>);
};
