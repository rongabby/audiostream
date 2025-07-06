import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistItemProps {
  file: { url: string; name: string };
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onEdit?: () => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ file, isActive, onSelect, onRemove, onEdit }) => {
  return (
    <TouchableOpacity 
      onPress={onSelect}
      style={[styles.container, isActive && styles.active]}
    >
      <View style={styles.content}>
        <Ionicons 
          name="musical-note" 
          size={24} 
          color={isActive ? '#ff4757' : '#888'} 
        />
        <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>
          {file.name.replace('.mp3', '')}
        </Text>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={18} color="#888" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
          <Ionicons name="close" size={18} color="#888" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  active: {
    backgroundColor: '#3c2c2c',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  activeName: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  removeButton: {
    padding: 5,
  },
});

export default PlaylistItem;