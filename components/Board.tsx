import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Cell from './Cell';

type BoardProps = {
  grid: number[][];
};

const Board: React.FC<BoardProps> = ({ grid }) => {
  const { width } = useWindowDimensions();

  // Calculate board size based on screen width. Leave some horizontal padding (container has 20px padding).
  const maxBoard = 360; // maximum board size
  const horizontalPadding = 40; // total container horizontal padding (20 left + 20 right)
  const boardPadding = 8; // inner board padding
  const gap = 8; // gap between cells
  const boardSize = Math.min(width - horizontalPadding, maxBoard);

  // inner space available for cells (exclude board inner padding)
  const inner = boardSize - boardPadding * 2;
  const cols = 4;
  const cellSize = Math.floor((inner - gap * (cols - 1)) / cols);

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize, padding: boardPadding }]}> 
      {grid.map((row, i) => (
        <View key={`row-${i}`} style={styles.row}>
          {row.map((value, j) => (
            <Cell key={`${i}-${j}`} value={value} size={cellSize} gap={gap} isLast={j === row.length - 1} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    // stack rows vertically
    flexDirection: 'column',
    // use rows instead of wrapping to ensure a stable 4x4 layout
    width: 320,
    height: 320,
    backgroundColor: '#a8a29e', // stone-400
    borderRadius: 16,
    overflow: 'hidden',
    padding: 8,
    justifyContent: 'center',
    alignContent: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default Board;
