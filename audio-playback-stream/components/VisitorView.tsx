import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import AudioPlayer from './AudioPlayer';
import ScrollToTopBottom from './ScrollToTopBottom';

interface AudioFile {
  url: string;
  name: string;
  dateAdded: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  audio_files: AudioFile[];
  is_active: boolean;
}

export default function VisitorView() {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchActivePlaylist();
  }, []);

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
    if (!activePlaylist || activePlaylist.audio_files.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % activePlaylist.audio_files.length;
    setCurrentIndex(nextIndex);
    setCurrentFile(activePlaylist.audio_files[nextIndex]);
  };

  const playPrevious = () => {
    if (!activePlaylist || activePlaylist.audio_files.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? activePlaylist.audio_files.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentFile(activePlaylist.audio_files[prevIndex]);
  };

  const selectTrack = (index: number) => {
    if (!activePlaylist || !activePlaylist.audio_files[index]) return;
    
    setCurrentIndex(index);
    setCurrentFile(activePlaylist.audio_files[index]);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  if (!activePlaylist) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlaylistTitle}>🎵 No Active Playlist</Text>
        <Text style={styles.noPlaylistText}>
          The administrator hasn't scheduled any playlist yet.
        </Text>
        <Text style={styles.noPlaylistSubtext}>
          Check back later for music!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchActivePlaylist}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.playlistTitle}>{activePlaylist.name}</Text>
          {activePlaylist.description && (
            <Text style={styles.playlistDescription}>{activePlaylist.description}</Text>
          )}
        </View>

        {currentFile && (
          <AudioPlayer 
            audioUrl={currentFile.url} 
            title={currentFile.name.replace('.mp3', '')}
            onNext={playNext}
            onPrevious={playPrevious}
          />
        )}

        <View style={styles.trackList}>
          <Text style={styles.trackListTitle}>
            Playlist ({activePlaylist.audio_files.length} tracks)
          </Text>
          {activePlaylist.audio_files.map((file, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.trackItem,
                index === currentIndex && styles.activeTrackItem
              ]}
              onPress={() => selectTrack(index)}
            >
              <View style={styles.trackInfo}>
                <Text style={[
                  styles.trackName,
                  index === currentIndex && styles.activeTrackName
                ]}>
                  {file.name.replace('.mp3', '')}
                </Text>
                <Text style={styles.trackIndex}>Track {index + 1}</Text>
              </View>
              {index === currentIndex && (
                <Text style={styles.nowPlayingIndicator}>♪</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchActivePlaylist}>
          <Text style={styles.refreshButtonText}>Refresh Playlist</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <ScrollToTopBottom 
        onScrollToTop={scrollToTop}
        onScrollToBottom={scrollToBottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, padding: 20 },
  loadingText: { color: 'white', fontSize: 18, textAlign: 'center', marginTop: 50 },
  header: { alignItems: 'center', marginBottom: 20 },
  playlistTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  playlistDescription: { fontSize: 16, color: '#ccc', textAlign: 'center', marginTop: 8 },
  noPlaylistTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
  noPlaylistText: { fontSize: 18, color: '#ccc', textAlign: 'center', marginBottom: 10 },
  noPlaylistSubtext: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 30 },
  trackList: { marginTop: 20 },
  trackListTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  trackItem: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  activeTrackItem: { backgroundColor: 'rgba(0, 122, 255, 0.3)' },
  trackInfo: { flex: 1 },
  trackName: { color: 'white', fontSize: 16, fontWeight: '500' },
  activeTrackName: { color: '#007AFF' },
  trackIndex: { color: '#888', fontSize: 12, marginTop: 2 },
  nowPlayingIndicator: { color: '#007AFF', fontSize: 20, fontWeight: 'bold' },
  refreshButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  refreshButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});