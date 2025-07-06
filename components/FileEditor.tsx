import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AudioFile {
  url: string;
  name: string;
  dateAdded: number;
}

interface FileEditorProps {
  file: AudioFile;
  onSave: (updatedFile: AudioFile) => void;
  onCancel: () => void;
}

const FileEditor: React.FC<FileEditorProps> = ({ file, onSave, onCancel }) => {
  const [newName, setNewName] = useState(file.name.replace('.mp3', ''));
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      Alert.alert('Error', 'File name cannot be empty');
      return;
    }

    if (trimmedName === file.name.replace('.mp3', '')) {
      onCancel();
      return;
    }

    setIsLoading(true);
    try {
      const updatedFile = {
        ...file,
        name: trimmedName.endsWith('.mp3') ? trimmedName : `${trimmedName}.mp3`
      };
      
      onSave(updatedFile);
    } catch (error) {
      console.error('Error saving file name:', error);
      Alert.alert('Error', 'Failed to save file name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="create-outline" size={24} color="#ff4757" />
        <Text style={styles.title}>Edit File Name</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>File Name:</Text>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="Enter file name"
          placeholderTextColor="#666"
          autoFocus
          selectTextOnFocus
        />
        <Text style={styles.extension}>.mp3</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          disabled={isLoading}
        >
          <Ionicons name="close" size={20} color="white" />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
    position: 'absolute',
    top: -20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    color: 'white',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  extension: {
    color: '#888',
    fontSize: 16,
    marginLeft: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#ff4757',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default FileEditor;
