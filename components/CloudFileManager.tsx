import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { getCloudFiles } from '@/app/lib/uploadService';
import { AudioFile, CloudFile } from '@/types';

interface CloudFileManagerProps {
  onFilesSelected: (files: AudioFile[]) => void;
  currentFiles: AudioFile[];
}

export default function CloudFileManager({ onFilesSelected, currentFiles }: CloudFileManagerProps) {
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showCloudFiles, setShowCloudFiles] = useState(false);

  useEffect(() => {
    if (showCloudFiles) {
      fetchCloudFiles();
    }
  }, [showCloudFiles]);

  const fetchCloudFiles = async () => {
    setLoading(true);
    try {
      const result = await getCloudFiles();
      if (result.success && result.files) {
        setCloudFiles(result.files);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch cloud files');
      }
    } catch (error) {
      console.error('Error fetching cloud files:', error);
      Alert.alert('Error', 'Failed to fetch cloud files');
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (file: CloudFile) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    setSelectedFiles(newSelected);
  };

  const addSelectedFilesToPlaylist = () => {
    const selectedCloudFiles = cloudFiles.filter(file => selectedFiles.has(file.id));
    const newAudioFiles: AudioFile[] = selectedCloudFiles.map(file => ({
      url: file.publicUrl,
      name: file.name.replace(/^\d+_/, ''), // Remove timestamp prefix
      dateAdded: new Date().toISOString(),
      cloudFile: true,
      originalName: file.name
    }));

    // Filter out files that are already in the current playlist
    const existingUrls = new Set(currentFiles.map(f => f.url));
    const uniqueNewFiles = newAudioFiles.filter(file => !existingUrls.has(file.url));

    if (uniqueNewFiles.length === 0) {
      Alert.alert('Info', 'All selected files are already in the current playlist');
      return;
    }

    onFilesSelected([...currentFiles, ...uniqueNewFiles]);
    setSelectedFiles(new Set());
    Alert.alert('Success', `Added ${uniqueNewFiles.length} files to the current playlist`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  if (!showCloudFiles) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowCloudFiles(true)}
        >
          <Text style={styles.toggleButtonText}>☁️ Add Files from Cloud Storage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Cloud Storage Files</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowCloudFiles(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading cloud files...</Text>
        </View>
      ) : (
        <>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchCloudFiles}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            
            {selectedFiles.size > 0 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={addSelectedFilesToPlaylist}
              >
                <Text style={styles.addButtonText}>
                  Add {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.fileList}>
            {cloudFiles.length === 0 ? (
              <Text style={styles.emptyText}>No audio files found in cloud storage</Text>
            ) : (
              cloudFiles.map((file) => {
                const isSelected = selectedFiles.has(file.id);
                const isInPlaylist = currentFiles.some(f => f.url === file.publicUrl);
                
                return (
                  <TouchableOpacity
                    key={file.id}
                    style={[
                      styles.fileItem,
                      isSelected && styles.fileItemSelected,
                      isInPlaylist && styles.fileItemInPlaylist
                    ]}
                    onPress={() => !isInPlaylist && toggleFileSelection(file)}
                    disabled={isInPlaylist}
                  >
                    <View style={styles.fileInfo}>
                      <Text style={[
                        styles.fileName,
                        isInPlaylist && styles.fileNameInPlaylist
                      ]}>
                        {file.name.replace(/^\d+_/, '')}
                      </Text>
                      <Text style={styles.fileDetails}>
                        {formatFileSize(file.size)} • {formatDate(file.created_at)}
                      </Text>
                      {isInPlaylist && (
                        <Text style={styles.inPlaylistText}>Already in playlist</Text>
                      )}
                    </View>
                    
                    <View style={styles.fileActions}>
                      {isInPlaylist ? (
                        <Text style={styles.checkmark}>✓</Text>
                      ) : (
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected
                        ]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fileList: {
    maxHeight: 300,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  fileItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  fileItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  fileItemInPlaylist: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    opacity: 0.7,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  fileNameInPlaylist: {
    color: '#ccc',
  },
  fileDetails: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  inPlaylistText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  fileActions: {
    marginLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
