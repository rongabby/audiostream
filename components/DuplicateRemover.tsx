import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface AudioFile {
  url: string;
  name: string;
  dateAdded: number;
}

interface DuplicateRemoverProps {
  audioFiles: AudioFile[];
  onRemoveDuplicates: (uniqueFiles: AudioFile[]) => void;
}

export default function DuplicateRemover({ audioFiles, onRemoveDuplicates }: DuplicateRemoverProps) {
  const [loading, setLoading] = useState(false);

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
                onRemoveDuplicates(unique);
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
        <Text style={styles.duplicateInfo}>
          Duplicates found: {duplicates.length}
        </Text>
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