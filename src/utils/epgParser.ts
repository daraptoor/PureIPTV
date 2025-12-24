import { XMLParser } from 'fast-xml-parser';
import pako from 'pako';

export interface EPGProgram {
    id: string; // channel id
    title: string;
    description: string;
    start: Date;
    end: Date;
}

export type EPGData = Record<string, EPGProgram[]>;

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
});

// Helper to safely decode Uint8Array to string with size check
const decodeWithLimit = (uint8Array: Uint8Array, limitBytes: number = 25 * 1024 * 1024): string => {
    if (uint8Array.length > limitBytes) {
        throw new RangeError(`EPG data too large: ${(uint8Array.length / (1024 * 1024)).toFixed(1)}MB. Limit is 25MB.`);
    }
    return new TextDecoder().decode(uint8Array);
};

export const fetchAndParseEPG = async (url: string): Promise<EPGData> => {
    try {
        console.log(`[EPG Parser] Fetching from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            const errorMsg = `Failed to fetch EPG: ${response.status} ${response.statusText}`;
            console.error(`[EPG Parser] ${errorMsg}`);
            throw new Error(errorMsg);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        let xmlContent: string;

        // Check if gzipped: Magic bytes are 0x1f 0x8b
        const isGzipped = url.toLowerCase().endsWith('.gz') || (uint8Array.length > 2 && uint8Array[0] === 0x1f && uint8Array[1] === 0x8b);

        try {
            if (isGzipped) {
                // Decompress to Uint8Array first to control memory
                const decompressed = pako.ungzip(uint8Array);
                console.log(`[EPG Parser] Successfully decompressed GZIP data: ${(decompressed.length / (1024 * 1024)).toFixed(1)}MB raw`);
                xmlContent = decodeWithLimit(decompressed);
            } else {
                console.log(`[EPG Parser] Processing as plain XML text: ${(uint8Array.length / (1024 * 1024)).toFixed(1)}MB`);
                xmlContent = decodeWithLimit(uint8Array);
            }
        } catch (e) {
            if (e instanceof RangeError) {
                console.error(`[EPG Parser] ${e.message}`);
                // Return empty to prevent crash, user will see "No programs"
                return {};
            }
            throw e;
        }

        const xmlData = parser.parse(xmlContent);
        const tvData = xmlData.tv;

        if (!tvData || !tvData.programme) {
            console.warn('[EPG Parser] Invalid EPG XML structure or no programs found');
            return {};
        }

        const programmes = Array.isArray(tvData.programme) ? tvData.programme : [tvData.programme];
        console.log(`[EPG Parser] Found ${programmes.length} programs`);

        const epgData: EPGData = {};

        // Limit processing to prevent memory issues if guide is still huge
        const maxPrograms = 50000;
        const itemsToProcess = programmes.slice(0, maxPrograms);
        if (programmes.length > maxPrograms) {
            console.warn(`[EPG Parser] Truncating EPG to ${maxPrograms} programs to maintain stability`);
        }

        itemsToProcess.forEach((prog: any) => {
            const channelId = prog.channel;
            if (!channelId) return;
            // Parse common EPG date format: YYYYMMDDhhmmss +0000
            const parseDate = (dateStr: string) => {
                if (!dateStr) return new Date();
                try {
                    const year = parseInt(dateStr.substring(0, 4));
                    const month = parseInt(dateStr.substring(4, 6)) - 1;
                    const day = parseInt(dateStr.substring(6, 8));
                    const hour = parseInt(dateStr.substring(8, 10));
                    const minute = parseInt(dateStr.substring(10, 12));
                    const second = parseInt(dateStr.substring(12, 14));
                    return new Date(Date.UTC(year, month, day, hour, minute, second));
                } catch (e) {
                    return new Date();
                }
            };

            const program: EPGProgram = {
                id: channelId,
                title: typeof prog.title === 'string' ? prog.title : (prog.title?.['#text'] || prog.title || 'No Title'),
                description: typeof prog.desc === 'string' ? prog.desc : (prog.desc?.['#text'] || prog.desc || ''),
                start: parseDate(prog.start),
                end: parseDate(prog.stop),
            };

            if (!epgData[channelId]) {
                epgData[channelId] = [];
            }
            epgData[channelId].push(program);
        });

        // Sort programs by start time for each channel
        Object.keys(epgData).forEach(channelId => {
            epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
        });

        return epgData;

    } catch (error) {
        console.error('[EPG Parser] Fatal error fetching/parsing EPG:', error);
        return {};
    }
};
