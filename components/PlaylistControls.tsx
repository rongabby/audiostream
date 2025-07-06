import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistControlsProps {
  onShuffle: () => void;
  onSortByName: () => void;
  onSortByDate: () => void;
  onReverseOrder: () => void;
  totalFiles: number;
}

const PlaylistControls: React.FC<PlaylistControlsProps> = ({
  onShuffle,
  onSortByName,
  onSortByDate,
  onReverseOrder,
  totalFiles
}) => {
  if (totalFiles === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎛️ Playlist Controls</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={onShuffle}>
          <Ionicons name="shuffle" size={18} color="white" />
          <Text style={styles.buttonText}>Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onSortByName}>
          <Ionicons name="text" size={18} color="white" />
          <Text style={styles.buttonText}>A-Z</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onSortByDate}>
          <Ionicons name="time" size={18} color="white" />
          <Text style={styles.buttonText}>Date</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onReverseOrder}>
          <Ionicons name="swap-vertical" size={18} color="white" />
          <Text style={styles.buttonText}>Reverse</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.info}>Total: {totalFiles} files</Text>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  info: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PlaylistControls;