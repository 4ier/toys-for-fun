export enum PieceType {
  CAO_CAO = 'CAO_CAO',
  GENERAL_V = 'GENERAL_V', // Vertical 1x2
  GENERAL_H = 'GENERAL_H', // Horizontal 2x1
  SOLDIER = 'SOLDIER',     // 1x1
}

export interface Piece {
  id: string;
  type: PieceType;
  label: string;
  x: number; // Grid coordinate 0-3
  y: number; // Grid coordinate 0-4
  w: number; // Width in grid units
  h: number; // Height in grid units
  color: string;
}

export interface GameState {
  pieces: Piece[];
  moveCount: number;
  isWon: boolean;
  history: Piece[][]; // For undo functionality
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface GridPosition {
  x: number;
  y: number;
}
