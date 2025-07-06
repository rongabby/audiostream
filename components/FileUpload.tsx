import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { uploadAudioFile } from '@/app/lib/uploadService';

interface FileUploadProps {
  onFileSelect: (file: { url: string; name: string }) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAudioFile(file);
      
      if (result.error) {
        console.warn('Upload warning:', result.error);
        // Still proceed with local URL if upload fails
      }

      onFileSelect({ 
        url: result.publicUrl || result.url || URL.createObjectURL(file), 
        name: result.fileName || file.name 
      });
    } catch (error) {
      console.error('File processing error:', error);
      // Fallback to local URL
      const url = URL.createObjectURL(file);
      onFileSelect({ url, name: file.name });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp3,audio/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          processFile(file);
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
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Create a wrapper div for drag and drop functionality
  const UploadWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof window !== 'undefined') {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ width: '100%' }}
        >
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <UploadWrapper>
      <TouchableOpacity 
        onPress={handleFileSelect}
        style={[styles.container, isDragOver && styles.dragOver]}
        disabled={isUploading}
      >
        <View style={styles.content}>
          {isUploading ? (
            <>
              <ActivityIndicator size="large" color="#ff4757" />
              <Text style={styles.title}>Uploading...</Text>
              <Text style={styles.subtitle}>Please wait while we upload your file</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={48} color="#ff4757" />
              <Text style={styles.title}>Upload MP3 File</Text>
              <Text style={styles.subtitle}>Click to browse or drag & drop</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </UploadWrapper>
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