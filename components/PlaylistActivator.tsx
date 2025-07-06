import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';
import { AudioFile, Playlist } from '@/types';

interface PlaylistActivatorProps {
  onPlaylistActivated: (playlist: Playlist) => void;
}

export default function PlaylistActivator({ onPlaylistActivated }: PlaylistActivatorProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Ensure audio_files is always an array of AudioFile objects
      setPlaylists(
        (data || []).map((playlist: any) => ({
          ...playlist,
          audio_files: Array.isArray(playlist.audio_files)
            ? playlist.audio_files
            : typeof playlist.audio_files === 'string'
              ? JSON.parse(playlist.audio_files)
              : [],
        }))
      );
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const activatePlaylist = async (playlist: Playlist) => {
    try {
      setLoading(true);
      
      // Deactivate all playlists first
      await supabase
        .from('playlists')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
      
      // Activate the selected playlist
      const { error } = await supabase
        .from('playlists')
        .update({ is_active: true })
        .eq('id', playlist.id);
      
      if (error) throw error;
      
      // Update local state
      setPlaylists(prev => 
        prev.map(p => ({
          ...p,
          is_active: p.id === playlist.id
        }))
      );
      
      onPlaylistActivated({ ...playlist, is_active: true });
      Alert.alert('Success', `"${playlist.name}" is now the active playlist`);
    } catch (error) {
      console.error('Error activating playlist:', error);
      Alert.alert('Error', 'Failed to activate playlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading && playlists.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading playlists...</Text>
      </View>
    );
  }

  if (playlists.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No playlists available</Text>
        <Text style={styles.emptySubtext}>Create a playlist first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={24} color="#ff4757" />
        <Text style={styles.title}>Activate Playlist</Text>
        <TouchableOpacity onPress={fetchPlaylists} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {playlists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={[
              styles.playlistItem,
              playlist.is_active && styles.activePlaylistItem
            ]}
            onPress={() => activatePlaylist(playlist)}
            disabled={loading}
          >
            <View style={styles.playlistContent}>
              <View style={styles.playlistInfo}>
                <Text style={[
                  styles.playlistName,
                  playlist.is_active && styles.activePlaylistName
                ]}>
                  {playlist.name}
                </Text>
                {playlist.description && (
                  <Text style={styles.playlistDescription}>
                    {playlist.description}
                  </Text>
                )}
                <Text style={styles.trackCount}>
                  {playlist.audio_files.length} track{playlist.audio_files.length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              <View style={styles.playlistActions}>
                {playlist.is_active ? (
                  <View style={styles.activeIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#ff4757" />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                ) : (
                  <View style={styles.activateButton}>
                    <Ionicons name="play-circle-outline" size={24} color="white" />
                    <Text style={styles.activateText}>Activate</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  playlistItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  activePlaylistItem: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activePlaylistName: {
    color: '#ff4757',
  },
  playlistDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  trackCount: {
    color: '#888',
    fontSize: 12,
  },
  playlistActions: {
    alignItems: 'center',
  },
  activeIndicator: {
    alignItems: 'center',
  },
  activeText: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  activateButton: {
    alignItems: 'center',
  },
  activateText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});
