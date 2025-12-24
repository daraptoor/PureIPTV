import { BlurView } from 'expo-blur';
import { VideoView } from 'expo-video';
import { List, Monitor, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEPG } from '../hooks/useEPG';
import { useStore } from '../store/useStore';

export const GlobalPlayer = () => {
    const insets = useSafeAreaInsets();
    const activeChannel = useStore((state) => state.activeChannel);
    const setActiveChannel = useStore((state) => state.setActiveChannel);
    const sharedPlayer = useStore((state) => state.sharedPlayer);
    const pipEnabled = useStore((state) => state.pipEnabled);

    const videoRef = useRef<VideoView>(null);

    const { getCurrentProgram, fetchEPG, data: epgData } = useEPG();
    const [showGuide, setShowGuide] = useState(false);

    if (!activeChannel) return null;

    const currentProgram = getCurrentProgram(activeChannel.id);

    const handleClose = () => {
        setActiveChannel(null);
    };

    const toggleGuide = () => {
        LayoutAnimation.configureNext({
            duration: 200,
            create: { type: 'easeInEaseOut', property: 'opacity' },
            update: { type: 'easeInEaseOut' },
            delete: { type: 'easeInEaseOut', property: 'opacity' },
        });
        if (!showGuide && !epgData) {
            fetchEPG();
        }
        setShowGuide(!showGuide);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Video Area (16:9) */}
            <View style={styles.videoContainer}>
                <VideoView
                    ref={videoRef}
                    key={`player-${activeChannel.id}`}
                    style={styles.video}
                    player={sharedPlayer}
                    nativeControls={true}
                    contentFit="contain"
                    allowsPictureInPicture={pipEnabled}
                />

                {/* Overlays */}
                <View style={styles.videoOverlay} pointerEvents="box-none">
                    <View style={styles.topRight}>
                        {pipEnabled && (
                            <Pressable
                                onPress={() => videoRef.current?.startPictureInPicture()}
                                style={[styles.iconButton, { marginRight: 8 }]}
                            >
                                <BlurView intensity={80} tint="dark" style={styles.blurCircle}>
                                    <Monitor color="white" size={16} />
                                </BlurView>
                            </Pressable>
                        )}
                        <Pressable onPress={handleClose} style={styles.iconButton}>
                            <BlurView intensity={80} tint="dark" style={styles.blurCircle}>
                                <X color="white" size={16} />
                            </BlurView>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Info Bar */}
            <View style={styles.infoBar}>
                <View style={styles.channelInfoWrapper}>
                    <Text style={styles.channelName} numberOfLines={1}>
                        {activeChannel.name}
                    </Text>
                    <Text style={styles.programName} numberOfLines={1}>
                        {currentProgram?.title || 'No Program Info'}
                    </Text>
                </View>

                <Pressable
                    onPress={toggleGuide}
                    style={[styles.guideButton, showGuide && styles.guideButtonActive]}
                >
                    <List color={showGuide ? "white" : "#007AFF"} size={20} />
                </Pressable>
            </View>

            {/* Inline Guide Section */}
            {showGuide && (
                <View style={styles.inlineGuideContainer}>
                    <View style={styles.guideHeaderInline}>
                        <Text style={styles.guideTimeInline}>
                            {currentProgram ?
                                `${currentProgram.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${currentProgram.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : ''}
                        </Text>
                    </View>
                    <Text style={styles.guideDescriptionInline}>
                        {currentProgram?.description || 'No description available for this program.'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        flex: 1,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 10,
        zIndex: 10,
    },
    topRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },

    // Info Bar Styles
    infoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1c1c1e',
    },
    channelInfoWrapper: {
        flex: 1,
        marginRight: 12,
    },
    channelName: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    programName: {
        color: '#8E8E93',
        fontSize: 12,
    },
    guideButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideButtonActive: {
        backgroundColor: '#007AFF',
    },

    // Icon Buttons
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
    },
    blurCircle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Inline Guide Styles
    inlineGuideContainer: {
        backgroundColor: '#1c1c1e',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 0,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    guideHeaderInline: {
        marginBottom: 8,
    },
    guideTimeInline: {
        color: '#007AFF',
        fontSize: 12,
        fontWeight: '600',
    },
    guideDescriptionInline: {
        color: '#D1D1D6',
        fontSize: 14,
        lineHeight: 20,
    },
});
