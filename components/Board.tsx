import React from 'react';
import { StyleSheet, View } from 'react-native';
import Cell from './Cell';

type BoardProps = {
  grid: number[][];
};

const Board: React.FC<BoardProps> = ({ grid }) => {
  return (
    <View style={styles.board}>
      {grid.map((row, i) =>
        row.map((value, j) => <Cell key={`${i}-${j}`} value={value} />)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    height: 320,
    backgroundColor: '#a8a29e', // stone-400
    borderRadius: 16,
    padding: 8,
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default Board;
