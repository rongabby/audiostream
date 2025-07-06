import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import AudioPlayer from './AudioPlayer';
import ScrollToTopBottom from './ScrollToTopBottom';
import { AudioFile, Playlist } from '@/types';

interface VisitorViewProps {
  uploadedFiles?: AudioFile[];
  isPlaylistLooping?: boolean;
  onTogglePlaylistLoop?: () => void;
}

export default function VisitorView({ uploadedFiles = [], isPlaylistLooping = false, onTogglePlaylistLoop }: VisitorViewProps) {
  console.log('VisitorView rendered with uploadedFiles:', uploadedFiles.length, uploadedFiles);
  
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [useUploadedFiles, setUseUploadedFiles] = useState(false);
  const [visitorPlaylistLooping, setVisitorPlaylistLooping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('VisitorView: Fetching active playlist...');
    fetchActivePlaylist();
  }, []);

  useEffect(() => {
    // Always prioritize uploaded files when they're available
    if (uploadedFiles.length > 0) {
      console.log('VisitorView: Uploaded files detected:', uploadedFiles);
      setUseUploadedFiles(true);
      setCurrentFile(uploadedFiles[0]);
      setCurrentIndex(0);
    } else {
      console.log('VisitorView: No uploaded files, checking active playlist');
      setUseUploadedFiles(false);
    }
  }, [uploadedFiles]);

  const fetchActivePlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setActivePlaylist(null);
        } else {
          throw error;
        }
      } else {
        setActivePlaylist(data);
        if (data.audio_files.length > 0) {
          setCurrentFile(data.audio_files[0]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching active playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const playNext = () => {
    const files = useUploadedFiles ? uploadedFiles : (activePlaylist?.audio_files || []);
    if (files.length === 0) return;
    
    const isLastTrack = currentIndex === files.length - 1;
    const loopSetting = isPlaylistLooping !== undefined ? isPlaylistLooping : visitorPlaylistLooping;
    
    if (isLastTrack && !loopSetting) {
      // If we're at the last track and playlist looping is off, stop
      return;
    }
    
    const nextIndex = (currentIndex + 1) % files.length;
    setCurrentIndex(nextIndex);
    setCurrentFile(files[nextIndex]);
  };

  const playPrevious = () => {
    const files = useUploadedFiles ? uploadedFiles : (activePlaylist?.audio_files || []);
    if (files.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentFile(files[prevIndex]);
  };

  const selectTrack = (index: number) => {
    const files = useUploadedFiles ? uploadedFiles : (activePlaylist?.audio_files || []);
    if (!files[index]) return;
    
    setCurrentIndex(index);
    setCurrentFile(files[index]);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const toggleVisitorPlaylistLoop = () => {
    setVisitorPlaylistLooping(prev => !prev);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  if (!activePlaylist && uploadedFiles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlaylistTitle}>🎵 No Music Available</Text>
        <Text style={styles.noPlaylistText}>
          No active playlist found and no files have been uploaded yet.
        </Text>
        <Text style={styles.noPlaylistSubtext}>
          Ask the administrator to upload music or activate a playlist!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchActivePlaylist}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine which files to use
  const currentFiles = useUploadedFiles ? uploadedFiles : (activePlaylist?.audio_files || []);
  const currentPlaylistName = useUploadedFiles ? 'Uploaded Files' : (activePlaylist?.name || 'Playlist');
  const currentPlaylistDescription = useUploadedFiles ? 'Recently uploaded audio files' : activePlaylist?.description;

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef} 
        style={[styles.scrollView]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={false}
        bounces={false}
        // @ts-ignore - Web-specific props
        className="visitor-scroll-view"
      >
        <View style={styles.header}>
          <Text style={styles.playlistTitle}>{currentPlaylistName}</Text>
          {currentPlaylistDescription && (
            <Text style={styles.playlistDescription}>{currentPlaylistDescription}</Text>
          )}
          {useUploadedFiles && (
            <Text style={styles.sourceIndicator}>📁 Local Files</Text>
          )}
        </View>

        {currentFile && (
          <AudioPlayer 
            audioUrl={currentFile.url} 
            title={currentFile.name.replace('.mp3', '')}
            onNext={playNext}
            onPrevious={playPrevious}
            isVisitorMode={true}
            playlistLength={currentFiles.length}
            currentIndex={currentIndex}
            isPlaylistLooping={isPlaylistLooping !== undefined ? isPlaylistLooping : visitorPlaylistLooping}
            onTogglePlaylistLoop={onTogglePlaylistLoop || toggleVisitorPlaylistLoop}
          />
        )}

        <ScrollToTopBottom 
          onScrollToTop={scrollToTop}
          onScrollToBottom={scrollToBottom}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1, 
    padding: 20,
    backgroundColor: 'transparent',
    minHeight: 400,
    maxHeight: '70vh',
    // Add web-specific scrollbar styles
    ...({
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255, 71, 87, 0.7) rgba(255, 255, 255, 0.1)',
    } as any),
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingText: { color: 'white', fontSize: 18, textAlign: 'center', marginTop: 50 },
  header: { alignItems: 'center', marginBottom: 20 },
  playlistTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  playlistDescription: { fontSize: 16, color: '#ccc', textAlign: 'center', marginTop: 8 },
  sourceIndicator: { fontSize: 14, color: '#ff4757', textAlign: 'center', marginTop: 5, fontWeight: 'bold' },
  noPlaylistTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
  noPlaylistText: { fontSize: 18, color: '#ccc', textAlign: 'center', marginBottom: 10 },
  noPlaylistSubtext: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 30 },
  trackList: { marginTop: 20 },
  trackListTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  trackItem: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  activeTrackItem: { backgroundColor: 'rgba(255, 71, 87, 0.3)', borderWidth: 1, borderColor: '#ff4757' },
  trackInfo: { flex: 1 },
  trackName: { color: 'white', fontSize: 16, fontWeight: '500' },
  activeTrackName: { color: '#ff4757', fontWeight: 'bold' },
  trackIndex: { color: '#888', fontSize: 12, marginTop: 2 },
  nowPlayingIndicator: { color: '#ff4757', fontSize: 20, fontWeight: 'bold' },
  refreshButton: { backgroundColor: '#ff4757', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  refreshButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  bottomPadding: { height: 50 },
});