import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import ScrollToTopBottom from './ScrollToTopBottom';
import DuplicateRemover from './DuplicateRemover';

interface AudioFile {
  url: string;
  name: string;
  dateAdded?: number | string;
  [key: string]: any; // Allow additional fields for compatibility with Supabase JSON
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  audio_files: AudioFile[];
  is_active: boolean;
  created_at?: string;
}

interface AdminPanelProps {
  audioFiles: AudioFile[];
  onPlaylistActivated: (playlist: Playlist) => void;
  onFilesUpdated: (files: AudioFile[]) => void;
}

export default function AdminPanel({ audioFiles, onPlaylistActivated, onFilesUpdated }: AdminPanelProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name: newPlaylistName,
          description: newPlaylistDesc,
          audio_files: audioFiles,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setPlaylists(prev => [data, ...prev]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      Alert.alert('Success', 'Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const activatePlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      await supabase
        .from('playlists')
        .update({ is_active: false })
        .neq('id', 'dummy');

      const { data, error } = await supabase
        .from('playlists')
        .update({ is_active: true })
        .eq('id', playlistId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlaylists();
      onPlaylistActivated(data);
      Alert.alert('Success', 'Playlist activated for visitors!');
    } catch (error) {
      console.error('Error activating playlist:', error);
      Alert.alert('Error', 'Failed to activate playlist');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <Text style={styles.title}>🎛️ Admin Panel</Text>
        
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>Create New Playlist</Text>
          <TextInput
            style={styles.input}
            placeholder="Playlist name"
            placeholderTextColor="#888"
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            value={newPlaylistDesc}
            onChangeText={setNewPlaylistDesc}
          />
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={createPlaylist}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : `Create with ${audioFiles.length} files`}
            </Text>
          </TouchableOpacity>
        </View>

        <DuplicateRemover audioFiles={audioFiles} onFilesUpdated={onFilesUpdated} />

        <View style={styles.playlistsSection}>
          <Text style={styles.sectionTitle}>Manage Playlists</Text>
          {playlists.map((playlist) => (
            <View key={playlist.id} style={styles.playlistItem}>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistDesc}>
                  {playlist.description || 'No description'}
                </Text>
                <Text style={styles.playlistFiles}>
                  {playlist.audio_files.length} files
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.activateButton,
                  playlist.is_active && styles.activeButton
                ]}
                onPress={() => activatePlaylist(playlist.id)}
                disabled={loading}
              >
                <Text style={styles.activateButtonText}>
                  {playlist.is_active ? 'ACTIVE' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
  scrollView: { padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: 10, margin: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
  createSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#555' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  playlistsSection: {},
  playlistItem: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  playlistInfo: { flex: 1 },
  playlistName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  playlistDesc: { color: '#ccc', fontSize: 14, marginTop: 2 },
  playlistFiles: { color: '#888', fontSize: 12, marginTop: 2 },
  activateButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  activeButton: { backgroundColor: '#ffc107' },
  activateButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});