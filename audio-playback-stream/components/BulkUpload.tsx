import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BulkUploadProps {
  onFilesSelect: (files: { url: string; name: string }[]) => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onFilesSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp3,audio/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          const audioFiles = Array.from(files)
            .filter(file => file.type.startsWith('audio/'))
            .map(file => ({
              url: URL.createObjectURL(file),
              name: file.name
            }));
          
          if (audioFiles.length > 0) {
            onFilesSelect(audioFiles);
          } else {
            Alert.alert('Error', 'Please select audio files');
          }
        }
      };
      input.click();
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer?.files;
    if (files) {
      const audioFiles = Array.from(files)
        .filter((file: any) => file.type.startsWith('audio/'))
        .map((file: any) => ({
          url: URL.createObjectURL(file),
          name: file.name
        }));
      
      if (audioFiles.length > 0) {
        onFilesSelect(audioFiles);
      } else {
        Alert.alert('Error', 'Please select audio files');
      }
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <TouchableOpacity 
      onPress={handleFileSelect}
      style={[styles.container, isDragOver && styles.dragOver]}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-upload-outline" size={48} color="#ff4757" />
        <Text style={styles.title}>Bulk Upload MP3 Files</Text>
        <Text style={styles.subtitle}>Select multiple files at once</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 30,
    margin: 20,
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  dragOver: {
    borderColor: '#ff4757',
    backgroundColor: '#3c2c2c',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BulkUpload;