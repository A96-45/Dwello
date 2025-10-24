import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { X, Play, Pause, RotateCcw, Maximize, Volume2, VolumeX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualTourViewerProps {
  visible: boolean;
  onClose: () => void;
  tourData: {
    id: string;
    type: '360' | 'video' | 'slideshow';
    title: string;
    description?: string;
    media: {
      url: string;
      thumbnail?: string;
      duration?: number;
    }[];
    hotspots?: {
      id: string;
      x: number;
      y: number;
      title: string;
      description: string;
    }[];
  };
}

export default function VirtualTourViewer({
  visible,
  onClose,
  tourData,
}: VirtualTourViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentMedia = tourData.media[currentIndex];

  const handlePlayPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleMuteToggle = useCallback(() => {
    Haptics.selectionAsync();
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleNext = useCallback(() => {
    Haptics.selectionAsync();
    if (currentIndex < tourData.media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, tourData.media.length]);

  const handlePrevious = useCallback(() => {
    Haptics.selectionAsync();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRotation(0);
    setIsPlaying(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement fullscreen mode
    console.log('Fullscreen mode');
  }, []);

  const handleHotspotPress = useCallback((hotspot: typeof tourData.hotspots[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Show hotspot details
    console.log('Hotspot pressed:', hotspot.title);
  }, []);

  const render360Viewer = () => (
    <View style={styles.viewerContainer}>
      <Image
        source={{ uri: currentMedia.url }}
        style={[styles.mediaImage, { transform: [{ rotate: `${rotation}deg` }] }]}
        resizeMode="cover"
      />
      
      {tourData.hotspots && tourData.hotspots.map((hotspot) => (
        <TouchableOpacity
          key={hotspot.id}
          style={[
            styles.hotspot,
            {
              left: hotspot.x * SCREEN_WIDTH,
              top: hotspot.y * SCREEN_HEIGHT,
            }
          ]}
          onPress={() => handleHotspotPress(hotspot)}
        >
          <View style={styles.hotspotDot} />
        </TouchableOpacity>
      ))}

      <View style={styles.rotationControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideoViewer = () => (
    <View style={styles.viewerContainer}>
      <Image
        source={{ uri: currentMedia.thumbnail || currentMedia.url }}
        style={styles.mediaImage}
        resizeMode="cover"
      />
      
      <View style={styles.videoOverlay}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <Pause size={48} color="#FFFFFF" />
          ) : (
            <Play size={48} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {currentMedia.duration && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {Math.floor(currentMedia.duration / 60)}:{(currentMedia.duration % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSlideshowViewer = () => (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentIndex(index);
      }}
      style={styles.slideshowContainer}
    >
      {tourData.media.map((media, index) => (
        <View key={index} style={styles.slideContainer}>
          <Image
            source={{ uri: media.url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );

  const renderViewer = () => {
    switch (tourData.type) {
      case '360':
        return render360Viewer();
      case 'video':
        return renderVideoViewer();
      case 'slideshow':
        return renderSlideshowViewer();
      default:
        return renderSlideshowViewer();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{tourData.title}</Text>
              {tourData.description && (
                <Text style={styles.subtitle}>{tourData.description}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={handleFullscreen} style={styles.fullscreenButton}>
            <Maximize size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.viewerWrapper}>
          {renderViewer()}
        </View>

        {showControls && (
          <View style={styles.controls}>
            <View style={styles.mediaControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
                disabled={currentIndex === 0}
              >
                <Text style={[styles.controlText, currentIndex === 0 && styles.controlTextDisabled]}>
                  ←
                </Text>
              </TouchableOpacity>

              {tourData.type === 'video' && (
                <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
                  {isPlaying ? (
                    <Pause size={32} color="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
                disabled={currentIndex === tourData.media.length - 1}
              >
                <Text style={[
                  styles.controlText,
                  currentIndex === tourData.media.length - 1 && styles.controlTextDisabled
                ]}>
                  →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaCounter}>
                  {currentIndex + 1} of {tourData.media.length}
                </Text>
                {tourData.type === 'video' && (
                  <TouchableOpacity style={styles.muteButton} onPress={handleMuteToggle}>
                    {isMuted ? (
                      <VolumeX size={20} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {tourData.type === 'slideshow' && (
                <View style={styles.pagination}>
                  {tourData.media.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.toggleControls}
          onPress={() => setShowControls(!showControls)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
  fullscreenButton: {
    padding: 8,
  },
  viewerWrapper: {
    flex: 1,
    position: 'relative',
  },
  viewerContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  slideshowContainer: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotspot: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotspotDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rotationControls: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlTextDisabled: {
    color: '#666666',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mediaCounter: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  muteButton: {
    padding: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
