import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import { AudioFile, Playlist } from '@/types';

interface AppendToPlaylistProps {
  audioFiles: AudioFile[];
  onSuccess: () => void;
}

export default function AppendToPlaylist({ audioFiles, onSuccess }: AppendToPlaylistProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appendCompleted, setAppendCompleted] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      fetchPlaylists();
      setAppendCompleted(false);
    }
  }, [modalVisible]);

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

  const appendToPlaylist = async (playlistId: string) => {
    if (audioFiles.length === 0) {
      Alert.alert('Error', 'No files to append');
      return;
    }

    setLoading(true);
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');

      const existingUrls = new Set(playlist.audio_files.map(f => f.url));
      const newFiles = audioFiles.filter(f => !existingUrls.has(f.url));
      
      if (newFiles.length === 0) {
        Alert.alert('Info', 'All files already exist in this playlist');
        setLoading(false);
        return;
      }

      const updatedFiles = [...playlist.audio_files, ...newFiles];
      
      const { error } = await supabase
        .from('playlists')
        .update({ audio_files: updatedFiles })
        .eq('id', playlistId);

      if (error) throw error;
      
      Alert.alert('Success', `Added ${newFiles.length} new files to ${playlist.name}`);
      setAppendCompleted(true);
      // Only call onSuccess when files are actually appended
      onSuccess();
    } catch (error) {
      console.error('Error appending to playlist:', error);
      Alert.alert('Error', 'Failed to append files to playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setAppendCompleted(false);
    // Don't call onSuccess when just closing/canceling
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, appendCompleted && styles.playlistItemDisabled]}
      onPress={() => appendToPlaylist(item.id)}
      disabled={loading || appendCompleted}
    >
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistDesc}>
          {item.description || 'No description'}
        </Text>
        <Text style={styles.playlistFiles}>
          {item.audio_files.length} files
        </Text>
      </View>
      <Text style={[styles.appendText, appendCompleted && styles.appendTextDisabled]}>Append</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, audioFiles.length === 0 && styles.buttonDisabled]}
        onPress={() => setModalVisible(true)}
        disabled={audioFiles.length === 0}
      >
        <Text style={styles.buttonText}>
          Append {audioFiles.length} files to playlist
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Playlist</Text>
            
            {!appendCompleted ? (
              <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                style={styles.playlistList}
              />
            ) : (
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>Files appended successfully!</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  playlistList: {
    maxHeight: 400,
  },
  playlistItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  playlistItemDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.5,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistDesc: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  playlistFiles: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  appendText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appendTextDisabled: {
    color: '#666',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 40,
  },
  completedText: {
    color: '#28a745',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});