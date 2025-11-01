import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Instructions = () => {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginTop: 20 }}>
      <TouchableOpacity onPress={() => setShow(!show)} style={styles.button}>
        <Text style={styles.buttonText}>{show ? 'Hide Instructions' : 'How to Play'}</Text>
      </TouchableOpacity>

      {show && (
        <View style={styles.instructions}>
          <Text style={styles.title}>🎮 2048 Instructions</Text>
          <Text style={styles.item}>• Swipe to move tiles.</Text>
          <Text style={styles.item}>• Combine tiles to create bigger numbers.</Text>
          <Text style={styles.item}>• Reach 2048 to win!</Text>
          <Text style={styles.item}>• Game ends when no moves are left.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  instructions: {
    marginTop: 10,
    backgroundColor: '#a855f7',
    borderRadius: 10,
    padding: 15,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  item: { color: '#fff', fontSize: 14, marginBottom: 4 },
});

export default Instructions;
