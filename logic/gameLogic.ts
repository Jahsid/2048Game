// src/logic/gameLogic.ts
export type Grid = number[][];
export type MoveDirection = "left" | "right" | "up" | "down";

const GRID_SIZE = 4;

/**
 * Create an empty NxN grid (default N = 4)
 */
export const createEmptyGrid = (n = GRID_SIZE): Grid =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

/**
 * Generate initial grid with two random tiles (2 or 4)
 */
export const generateInitialGrid = (n = GRID_SIZE): Grid => {
  let grid = createEmptyGrid(n);
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
};

/**
 * Return shallow-cloned grid (clone rows) to avoid mutating original
 */
const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

/**
 * Add a random tile (2 with 90% chance, 4 with 10%) to a random empty cell.
 * Returns a new grid (does not mutate the input).
 */
export const addRandomTile = (grid: Grid): Grid => {
  const n = grid.length;
  if (n === 0) return grid;

  const emptyCells: [number, number][] = [];

  grid.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val === 0) emptyCells.push([i, j]);
    })
  );

  if (emptyCells.length === 0) return grid;

  const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = cloneGrid(grid);
  newGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

/**
 * Move and merge a single row to the left. Returns the new row and the gained score.
 */
const moveRowLeft = (row: number[]): { row: number[]; score: number } => {
  const filtered = row.filter((val) => val !== 0);
  const merged: number[] = [];
  let score = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const newVal = filtered[i] * 2;
      merged.push(newVal);
      score += newVal;
      i += 2; // skip next because merged
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }

  while (merged.length < row.length) merged.push(0);

  return { row: merged, score };
};

/**
 * Transpose a grid (rows <-> columns). Handles non-square by using min dims.
 */
const transpose = (grid: Grid): Grid => {
  const rows = grid.length;
  if (rows === 0) return grid;
  const cols = Math.max(...grid.map((r) => r.length));
  const transposed: Grid = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => 0)
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < (grid[i].length || 0); j++) {
      transposed[j][i] = grid[i][j];
    }
  }
  return transposed;
};

/**
 * Reverse each row in the grid (used for right/down moves)
 */
const reverseGrid = (grid: Grid): Grid => grid.map((row) => [...row].reverse());

/**
 * Compare two grids for equality (shape + values)
 */
const gridsAreEqual = (a: Grid, b: Grid): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
};

type MoveResult = {
  newGrid: Grid;
  score: number;
};

/**
 * Move the whole grid in a direction and return the new grid and score gained.
 * Does not mutate the incoming grid.
 */
export const moveGrid = (grid: Grid, direction: MoveDirection): MoveResult => {
  // Defensive: ensure grid is cloned and not mutated
  let newGrid: Grid = cloneGrid(grid);
  let totalScore = 0;

  const processGrid = (g: Grid): Grid =>
    g.map((row) => {
      const { row: newRow, score } = moveRowLeft(row);
      totalScore += score;
      return newRow;
    });

  switch (direction) {
    case "left":
      newGrid = processGrid(newGrid);
      break;
    case "right":
      newGrid = reverseGrid(processGrid(reverseGrid(newGrid)));
      break;
    case "up":
      newGrid = transpose(processGrid(transpose(newGrid)));
      break;
    case "down":
      newGrid = transpose(
        reverseGrid(processGrid(reverseGrid(transpose(newGrid))))
      );
      break;
    default:
      break;
  }

  // Only add a random tile if the grid actually changed
  if (!gridsAreEqual(newGrid, grid)) {
    newGrid = addRandomTile(newGrid);
  }

  return { newGrid, score: totalScore };
};

/**
 * True if any cell contains 2048
 */
export const checkWin = (grid: Grid): boolean =>
  grid.some((row) => row.some((v) => v === 2048));

/**
 * True if there are no moves left:
 * - no empty cells
 * - and no adjacent equal cells (horizontally or vertically)
 */
export const checkGameOver = (grid: Grid): boolean => {
  const n = grid.length;
  if (n === 0) return true;

  // If any empty cell exists -> not over
  for (let i = 0; i < n; i++) {
    if (grid[i].some((v) => v === 0)) return false;
  }

  // Check horizontal adjacency
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < (grid[i].length || 0) - 1; j++) {
      if (grid[i][j] === grid[i][j + 1]) return false;
    }
  }

  // Check vertical adjacency (careful with non-square)
  const cols = Math.max(...grid.map((r) => r.length));
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = grid[i][j] ?? null;
      const b = grid[i + 1][j] ?? null;
      if (a !== null && b !== null && a === b) return false;
    }
  }

  return true;
};
