import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  score: number;
  onRestart: () => void;
};

const Title: React.FC<Props> = ({ score, onRestart }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>🧮 Score: {score}</Text>
      <TouchableOpacity onPress={onRestart} style={styles.button}>
        <Text style={styles.buttonText}>↻ Restart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  score: { fontSize: 18, fontWeight: 'bold', color: '#f97316' },
  button: { backgroundColor: '#f97316', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Title;
