import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AdminPanel from '../components/AdminPanel';
import VisitorView from '../components/VisitorView';
import AudioPlayer from '../components/AudioPlayer';
import FileUpload from '../components/FileUpload';
import BulkUpload from '../components/BulkUpload';
import PlaylistItem from '../components/PlaylistItem';
import PlaylistControls from '../components/PlaylistControls';
import DuplicateRemover from '../components/DuplicateRemover';
import AppendToPlaylist from '../components/AppendToPlaylist';

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

export default function Index() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  const handleFileSelect = (file: { url: string; name: string }) => {
    const newFile = { ...file, dateAdded: Date.now() };
    setAudioFiles(prev => {
      const updated = [...prev, newFile];
      if (!currentFile) {
        setCurrentFile(newFile);
        setCurrentIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const handleBulkFileSelect = (files: { url: string; name: string }[]) => {
    const newFiles = files.map(file => ({ ...file, dateAdded: Date.now() }));
    setAudioFiles(prev => {
      const updated = [...prev, ...newFiles];
      if (!currentFile && newFiles.length > 0) {
        setCurrentFile(newFiles[0]);
        setCurrentIndex(prev.length);
      }
      return updated;
    });
  };

  const handleFileRemove = (index: number) => {
    const fileToRemove = audioFiles[index];
    setAudioFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      
      if (currentFile?.url === fileToRemove.url) {
        if (updated.length > 0) {
          const newIndex = Math.min(index, updated.length - 1);
          setCurrentFile(updated[newIndex]);
          setCurrentIndex(newIndex);
        } else {
          setCurrentFile(null);
          setCurrentIndex(0);
        }
      } else {
        // Update current index if needed
        const newCurrentIndex = updated.findIndex(f => f.url === currentFile?.url);
        if (newCurrentIndex >= 0) {
          setCurrentIndex(newCurrentIndex);
        }
      }
      
      return updated;
    });
  };

  const handleNext = () => {
    if (audioFiles.length > 0) {
      const nextIndex = (currentIndex + 1) % audioFiles.length;
      setCurrentIndex(nextIndex);
      setCurrentFile(audioFiles[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (audioFiles.length > 0) {
      const prevIndex = currentIndex === 0 ? audioFiles.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentFile(audioFiles[prevIndex]);
    }
  };

  const handlePlaylistItemSelect = (file: AudioFile) => {
    const index = audioFiles.findIndex(f => f.url === file.url);
    if (index >= 0) {
      setCurrentFile(file);
      setCurrentIndex(index);
    }
  };

  const handleShuffle = () => {
    setAudioFiles(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Update current index after shuffle
      if (currentFile) {
        const newIndex = shuffled.findIndex(f => f.url === currentFile.url);
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      }
      
      return shuffled;
    });
  };

  const handleSortByName = () => {
    setAudioFiles(prev => {
      const sorted = [...prev].sort((a, b) => a.name.localeCompare(b.name));
      
      // Update current index after sort
      if (currentFile) {
        const newIndex = sorted.findIndex(f => f.url === currentFile.url);
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      }
      
      return sorted;
    });
  };

  const handleSortByDate = () => {
    setAudioFiles(prev => {
      const sorted = [...prev].sort((a, b) => b.dateAdded - a.dateAdded);
      
      // Update current index after sort
      if (currentFile) {
        const newIndex = sorted.findIndex(f => f.url === currentFile.url);
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      }
      
      return sorted;
    });
  };

  const handleRemoveDuplicates = (uniqueFiles: AudioFile[]) => {
    setAudioFiles(uniqueFiles);
    if (currentFile && !uniqueFiles.find(f => f.url === currentFile.url)) {
      setCurrentFile(uniqueFiles[0] || null);
      setCurrentIndex(0);
    } else if (currentFile) {
      const newIndex = uniqueFiles.findIndex(f => f.url === currentFile.url);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    }
  };

  const handlePlaylistActivated = (playlist: Playlist) => {
    setActivePlaylist(playlist);
  };

  const handleFilesUpdated = (updatedFiles: AudioFile[]) => {
    setAudioFiles(updatedFiles);
    if (currentFile && !updatedFiles.find(f => f.url === currentFile.url)) {
      setCurrentFile(updatedFiles[0] || null);
      setCurrentIndex(0);
    } else if (currentFile) {
      const newIndex = updatedFiles.findIndex(f => f.url === currentFile.url);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    }
  };

  const handleAppendSuccess = () => {
    console.log('Files successfully appended to playlist');
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/6858c6b95dee2fd769bba65c_1751596538904_0c158712.jpg' }}
      style={styles.background}
      blurRadius={3}
    >
      <View style={styles.overlay}>
        <StatusBar style="light" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>🎵 Music Player</Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, !isAdminMode && styles.activeModeButton]}
                onPress={() => setIsAdminMode(false)}
              >
                <Text style={[styles.modeButtonText, !isAdminMode && styles.activeModeButtonText]}>Visitor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isAdminMode && styles.activeModeButton]}
                onPress={() => setIsAdminMode(true)}
              >
                <Text style={[styles.modeButtonText, isAdminMode && styles.activeModeButtonText]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isAdminMode ? (
            <View>
              <AdminPanel 
                audioFiles={audioFiles} 
                onPlaylistActivated={handlePlaylistActivated}
                onFilesUpdated={handleFilesUpdated}
              />
              
              <View style={styles.adminSection}>
                <Text style={styles.sectionTitle}>File Management</Text>
                
                {currentFile && (
                  <AudioPlayer 
                    key={currentFile.url}
                    audioUrl={currentFile.url} 
                    title={currentFile.name.replace('.mp3', '')} 
                    onNext={audioFiles.length > 1 ? handleNext : undefined}
                    onPrevious={audioFiles.length > 1 ? handlePrevious : undefined}
                  />
                )}

                {!currentFile && (
                  <View>
                    <FileUpload onFileSelect={handleFileSelect} />
                    <BulkUpload onFilesSelect={handleBulkFileSelect} />
                  </View>
                )}

                {audioFiles.length === 0 && !currentFile && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No audio files uploaded yet</Text>
                    <Text style={styles.emptySubtext}>Upload MP3 files to create playlists</Text>
                  </View>
                )}

                {audioFiles.length > 0 && (
                  <View style={styles.playlistSection}>
                    <AppendToPlaylist 
                      audioFiles={audioFiles} 
                      onSuccess={handleAppendSuccess} 
                    />
                    <PlaylistControls
                      onShuffle={handleShuffle}
                      onSortByName={handleSortByName}
                      onSortByDate={handleSortByDate}
                      totalFiles={audioFiles.length}
                    />
                    <Text style={styles.playlistTitle}>Current Files ({audioFiles.length})</Text>
                    {audioFiles.map((file, index) => (
                      <PlaylistItem
                        key={`${file.url}-${index}`}
                        file={file}
                        isActive={currentFile?.url === file.url}
                        onSelect={() => handlePlaylistItemSelect(file)}
                        onRemove={() => handleFileRemove(index)}
                      />
                    ))}
                    <View style={styles.uploadMore}>
                      <BulkUpload onFilesSelect={handleBulkFileSelect} />
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <VisitorView />
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  modeToggle: { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 25, padding: 4 },
  modeButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  activeModeButton: { backgroundColor: '#007AFF' },
  modeButtonText: { color: '#ccc', fontSize: 16, fontWeight: '600' },
  activeModeButtonText: { color: 'white' },
  adminSection: { marginTop: 20, padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 10, margin: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
  playlistSection: { marginTop: 20 },
  playlistTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  uploadMore: { marginTop: 20, marginBottom: 20 },
});