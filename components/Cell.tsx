import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CELL_COLORS: Record<number, string> = {
  0: '#d6d3d1',
  2: '#fef3c7',
  4: '#fde68a',
  8: '#fb923c',
  16: '#f97316',
  32: '#f87171',
  64: '#ef4444',
  128: '#facc15',
  256: '#eab308',
  512: '#ca8a04',
  1024: '#a16207',
  2048: '#713f12',
};

type CellProps = {
  value: number;
};

const Cell: React.FC<CellProps> = ({ value }) => {
  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: CELL_COLORS[value] || '#292524' },
      ]}
    >
      {value !== 0 && <Text style={styles.text}>{value}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 70,
    height: 70,
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#fff',
  },
});

export default Cell;
