import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AdminPanel from '../components/AdminPanel';
import VisitorView from '../components/VisitorView';
import AudioPlayer from '../components/AudioPlayer';
import FileUpload from '../components/FileUpload';
import BulkUpload from '../components/BulkUpload';
import PlaylistItem from '../components/PlaylistItem';
import PlaylistControls from '../components/PlaylistControls';
import DuplicateRemover from '../components/DuplicateRemover';
import AppendToPlaylist from '../components/AppendToPlaylist';
import FileEditor from '../components/FileEditor';
import Notification from '../components/Notification';
import PlaylistActivator from '../components/PlaylistActivator';
import { isSupabaseConfigured } from './lib/supabase';
import { AudioFile, Playlist } from '@/types';

export default function Index() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [editingFile, setEditingFile] = useState<AudioFile | null>(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

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

    // Show notification based on Supabase configuration
    if (isSupabaseConfigured()) {
      showNotification(`"${file.name}" uploaded to cloud storage`, 'success');
    } else {
      showNotification(`"${file.name}" loaded locally (cloud storage not configured)`, 'warning');
    }
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

    // Show notification for bulk upload
    const fileCount = files.length;
    if (isSupabaseConfigured()) {
      showNotification(`${fileCount} file${fileCount > 1 ? 's' : ''} uploaded to cloud storage`, 'success');
    } else {
      showNotification(`${fileCount} file${fileCount > 1 ? 's' : ''} loaded locally (cloud storage not configured)`, 'warning');
    }
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
    showNotification('Playlist shuffled randomly', 'info');
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
    showNotification('Files sorted alphabetically', 'info');
  };

  const handleSortByDate = () => {
    setAudioFiles(prev => {
      const sorted = [...prev].sort((a, b) => {
        const aDate = typeof a.dateAdded === 'number' ? a.dateAdded : 0;
        const bDate = typeof b.dateAdded === 'number' ? b.dateAdded : 0;
        return bDate - aDate;
      });
      
      // Update current index after sort
      if (currentFile) {
        const newIndex = sorted.findIndex(f => f.url === currentFile.url);
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      }
      
      return sorted;
    });
    showNotification('Files sorted by date (newest first)', 'info');
  };

  const handleReverseOrder = () => {
    setAudioFiles(prev => {
      const reversed = [...prev].reverse();
      
      // Update current index after reverse
      if (currentFile) {
        const newIndex = reversed.findIndex(f => f.url === currentFile.url);
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      }
      
      showNotification('Playlist order reversed', 'info');
      return reversed;
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
    showNotification(`"${playlist.name}" activated`, 'success');
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

  const scrollToUploadSection = () => {
    setShowUploadSection(true);
    // Scroll to upload section after state update
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setShowUploadSection(false);
    }, 3000);
  };

  const handleAppendSuccess = () => {
    console.log('Files successfully appended to playlist');
  };

  const handleEditFile = (file: AudioFile) => {
    setEditingFile(file);
  };

  const handleSaveFileEdit = (updatedFile: AudioFile) => {
    setAudioFiles(prev => 
      prev.map(file => 
        file.url === updatedFile.url ? updatedFile : file
      )
    );
    
    // Update current file if it's the one being edited
    if (currentFile?.url === updatedFile.url) {
      setCurrentFile(updatedFile);
    }
    
    setEditingFile(null);
    showNotification(`File renamed to "${updatedFile.name}"`, 'success');
  };

  const handleCancelFileEdit = () => {
    setEditingFile(null);
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/6858c6b95dee2fd769bba65c_1751596538904_0c158712.jpg' }}
      style={styles.background}
      blurRadius={3}
    >
      <View style={styles.overlay}>
        <StatusBar style="light" />
        
        {/* Notification Component */}
        <Notification
          message={notification.message}
          type={notification.type}
          visible={notification.visible}
          onHide={hideNotification}
        />
        
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
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
              {/* Quick Navigation */}
              <View style={styles.quickNav}>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={scrollToUploadSection}
                >
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text style={styles.quickNavText}>Jump to Upload</Text>
                </TouchableOpacity>
              </View>

              {/* Playlist Activator */}
              <PlaylistActivator 
                onPlaylistActivated={handlePlaylistActivated}
              />

              <AdminPanel 
                audioFiles={audioFiles} 
                onPlaylistActivated={handlePlaylistActivated}
                onFilesUpdated={handleFilesUpdated}
              />
              
              <View style={styles.adminSection}>
                <Text style={styles.sectionTitle}>📁 File Upload Center</Text>
                <View style={[styles.uploadSection, showUploadSection && styles.highlightedSection]}>
                  <FileUpload onFileSelect={handleFileSelect} />
                  <BulkUpload onFilesSelect={handleBulkFileSelect} />
                </View>
              </View>

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
                      onReverseOrder={handleReverseOrder}
                      totalFiles={audioFiles.length}
                    />
                    <DuplicateRemover
                      audioFiles={audioFiles}
                      onFilesUpdated={handleRemoveDuplicates}
                    />
                    
                    {editingFile && (
                      <FileEditor
                        file={editingFile}
                        onSave={handleSaveFileEdit}
                        onCancel={handleCancelFileEdit}
                      />
                    )}
                    
                    <Text style={styles.playlistTitle}>Current Files ({audioFiles.length})</Text>
                    {audioFiles.map((file, index) => (
                      <PlaylistItem
                        key={`${file.url}-${index}`}
                        file={file}
                        isActive={currentFile?.url === file.url}
                        onSelect={() => handlePlaylistItemSelect(file)}
                        onRemove={() => handleFileRemove(index)}
                        onEdit={() => handleEditFile(file)}
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
            <VisitorView uploadedFiles={audioFiles} />
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
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  quickNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickNavText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  uploadSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  highlightedSection: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderWidth: 2,
    borderColor: '#ff4757',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});