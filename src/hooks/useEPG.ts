import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchAndParseEPG } from '../utils/epgParser';
import { useChannels } from './useChannels';

export const useEPG = () => {
    const activeSourceUrl = useStore((state) => state.activeSourceUrl);
    const sources = useStore((state) => state.sources);
    const { data: channels } = useChannels();

    const activeSource = sources.find(s => s.url === activeSourceUrl);
    const epgUrl = activeSource?.epgUrl;

    // EPG is now strictly opt-in to prevent startup hang.
    // It will only fetch when 'fetchEPG' is called (e.g. opening the guide).
    const query = useQuery({
        queryKey: ['epg-data', epgUrl],
        queryFn: () => {
            if (!epgUrl) return null;
            return fetchAndParseEPG(epgUrl);
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!epgUrl, // Fetch automatically if URL exists
    });

    // Background sync and logging
    useEffect(() => {
        if (!query.data || !channels) return;

        const epgData = query.data;
        let matchCount = 0;

        channels.forEach(channel => {
            if (epgData[channel.id]) {
                // Log matches as requested
                console.log(`[EPG Sync] Synced data for: ${channel.name}`);
                matchCount++;
            }
        });

        if (matchCount > 0) {
            console.log(`[EPG Sync] Total channels synced: ${matchCount}`);
        }
    }, [query.data, channels]);

    const getCurrentProgram = useCallback((channelId: string) => {
        if (!query.data) return null;

        const programs = query.data[channelId];
        if (!programs) return null;

        const now = new Date();
        return programs.find(p => now >= p.start && now < p.end);
    }, [query.data]);

    return {
        ...query,
        fetchEPG: query.refetch,
        getCurrentProgram,
    };
};
