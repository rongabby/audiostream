import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ScrollToTopBottomProps {
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
}

export default function ScrollToTopBottom({ onScrollToTop, onScrollToBottom }: ScrollToTopBottomProps) {
  return (
    <>
      <TouchableOpacity style={[styles.scrollButton, styles.topButton]} onPress={onScrollToTop}>
        <Text style={styles.scrollButtonText}>↑ Top</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.scrollButton, styles.bottomButton]} onPress={onScrollToBottom}>
        <Text style={styles.scrollButtonText}>↓ Bottom</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  scrollButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  topButton: {
    top: 100,
  },
  bottomButton: {
    bottom: 100,
  },
  scrollButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});