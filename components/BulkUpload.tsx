import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { uploadAudioFile, UploadResult } from '@/app/lib/uploadService';

interface BulkUploadProps {
  onFilesSelect: (files: { url: string; name: string }[]) => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onFilesSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const processFiles = async (files: File[]) => {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      Alert.alert('Error', 'Please select audio files');
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Uploading 0/${audioFiles.length} files...`);
    
    try {
      const results: UploadResult[] = [];
      
      // Upload files one by one to show progress
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        setUploadProgress(`Uploading ${i + 1}/${audioFiles.length} files...`);
        
        const result = await uploadAudioFile(file);
        results.push(result);
      }

      // Process results and create file objects
      const processedFiles = results.map((result, index) => ({
        url: result.publicUrl || result.url || URL.createObjectURL(audioFiles[index]),
        name: result.fileName || audioFiles[index].name
      }));

      const successfulUploads = results.filter(r => r.success).length;
      const failedUploads = results.filter(r => !r.success).length;
      
      if (successfulUploads > 0) {
        console.log(`${successfulUploads} files successfully uploaded to cloud storage`);
      }
      if (failedUploads > 0) {
        console.warn(`${failedUploads} files failed to upload and will use local URLs`);
      }

      onFilesSelect(processedFiles);
    } catch (error) {
      console.error('Bulk upload error:', error);
      // Fallback to local URLs
      const fallbackFiles = audioFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name
      }));
      onFilesSelect(fallbackFiles);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleFileSelect = () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp3,audio/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          processFiles(Array.from(files));
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
      processFiles(Array.from(files));
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
              <Text style={styles.title}>Uploading Files...</Text>
              <Text style={styles.subtitle}>{uploadProgress}</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={48} color="#ff4757" />
              <Text style={styles.title}>Bulk Upload MP3 Files</Text>
              <Text style={styles.subtitle}>Click to browse or drag & drop multiple files</Text>
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