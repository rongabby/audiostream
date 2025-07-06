import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileUploadProps {
  onFileSelect: (file: { url: string; name: string }) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp3,audio/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            onFileSelect({ url, name: file.name });
          } else {
            Alert.alert('Error', 'Please select an audio file');
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
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        onFileSelect({ url, name: file.name });
      } else {
        Alert.alert('Error', 'Please select an audio file');
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
        <Text style={styles.title}>Upload MP3 File</Text>
        <Text style={styles.subtitle}>Click to browse or drag & drop</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 40,
    margin: 20,
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FileUpload;