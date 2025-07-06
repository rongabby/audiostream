import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AudioFile } from '@/types';

interface DuplicateRemoverProps {
  audioFiles: AudioFile[];
  onFilesUpdated: (uniqueFiles: AudioFile[]) => void;
}

export default function DuplicateRemover({ audioFiles, onFilesUpdated }: DuplicateRemoverProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const findDuplicates = () => {
    const seen = new Set<string>();
    const duplicates: AudioFile[] = [];
    const unique: AudioFile[] = [];

    audioFiles.forEach(file => {
      const key = file.name.toLowerCase().trim();
      if (seen.has(key)) {
        duplicates.push(file);
      } else {
        seen.add(key);
        unique.push(file);
      }
    });

    return { duplicates, unique };
  };

  const removeDuplicates = async () => {
    if (audioFiles.length === 0) {
      Alert.alert('No Files', 'No audio files to check for duplicates');
      return;
    }

    setLoading(true);
    try {
      const { duplicates, unique } = findDuplicates();
      
      if (duplicates.length === 0) {
        Alert.alert('No Duplicates', 'No duplicate files found!');
      } else {
        Alert.alert(
          'Duplicates Found',
          `Found ${duplicates.length} duplicate files. Remove them?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                onFilesUpdated(unique);
                Alert.alert('Success', `Removed ${duplicates.length} duplicate files`);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      Alert.alert('Error', 'Failed to remove duplicates');
    } finally {
      setLoading(false);
    }
  };

  const { duplicates } = findDuplicates();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Duplicate Remover</Text>
      <Text style={styles.info}>
        Total files: {audioFiles.length}
      </Text>
      {duplicates.length > 0 && (
        <>
          <Text style={styles.duplicateInfo}>
            Duplicates found: {duplicates.length}
          </Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Text>
          </TouchableOpacity>
          {showDetails && (
            <View style={styles.duplicateList}>
              <Text style={styles.duplicateListTitle}>Duplicate Files:</Text>
              {duplicates.map((file, index) => (
                <Text key={index} style={styles.duplicateItem}>
                  • {file.name}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={removeDuplicates}
        disabled={loading || audioFiles.length === 0}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Remove Duplicates'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10
  },
  info: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5
  },
  duplicateInfo: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  detailsButton: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12
  },
  duplicateList: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%'
  },
  duplicateListTitle: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  duplicateItem: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2
  },
  button: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonDisabled: {
    backgroundColor: '#555'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});