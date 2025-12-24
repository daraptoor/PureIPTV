import parser from 'iptv-playlist-parser';
const { parse } = parser;

export interface Channel {
    id: string;
    name: string;
    logo: string;
    group: string;
    url: string;
}

const NAME_CLEAN_REGEX = /\s*(\(\d+p\)|\[\w+\]|\{\w+\})\s*/gi;

export const parseM3U = (content: string): Channel[] => {
    try {
        const result = parse(content);

        return result.items.map((item, index) => {
            const cleanName = item.name.replace(NAME_CLEAN_REGEX, '').trim();
            const groupTitle = item.group.title || 'Uncategorized';

            return {
                id: item.tvg.id || `${cleanName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
                name: item.name,
                logo: item.tvg.logo || '',
                group: groupTitle,
                url: item.url
            };
        });
    } catch (e) {
        console.error("[M3U Parser] Error parsing M3U:", e);
        return [];
    }
};
