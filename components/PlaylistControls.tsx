import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistControlsProps {
  onShuffle: () => void;
  onSortByName: () => void;
  onSortByDate: () => void;
  totalFiles: number;
}

const PlaylistControls: React.FC<PlaylistControlsProps> = ({
  onShuffle,
  onSortByName,
  onSortByDate,
  totalFiles
}) => {
  if (totalFiles === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playlist Controls</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={onShuffle}>
          <Ionicons name="shuffle" size={20} color="white" />
          <Text style={styles.buttonText}>Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onSortByName}>
          <Ionicons name="text" size={20} color="white" />
          <Text style={styles.buttonText}>Sort A-Z</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onSortByDate}>
          <Ionicons name="time" size={20} color="white" />
          <Text style={styles.buttonText}>Sort by Date</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default PlaylistControls;