import { Piece, PieceType, Direction, GridPosition } from '../types';
import { GRID_ROWS, GRID_COLS, WIN_TARGET } from '../constants';

// Deep copy pieces to avoid mutation issues
export const clonePieces = (pieces: Piece[]): Piece[] => {
  return pieces.map(p => ({ ...p }));
};

// Check if a position is within the grid
const isValidPos = (x: number, y: number): boolean => {
  return x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS;
};

// Check collision with other pieces
const hasCollision = (
  id: string,
  targetX: number,
  targetY: number,
  w: number,
  h: number,
  pieces: Piece[]
): boolean => {
  // Check bounds
  if (!isValidPos(targetX, targetY) || !isValidPos(targetX + w - 1, targetY + h - 1)) {
    return true;
  }

  // Check overlap with other pieces
  for (const other of pieces) {
    if (other.id === id) continue;

    const isOverlap =
      targetX < other.x + other.w &&
      targetX + w > other.x &&
      targetY < other.y + other.h &&
      targetY + h > other.y;

    if (isOverlap) return true;
  }

  return false;
};

// Attempt to move a piece
export const tryMovePiece = (
  pieces: Piece[],
  pieceId: string,
  direction: Direction
): Piece[] | null => {
  const currentPieces = clonePieces(pieces);
  const pieceIndex = currentPieces.findIndex(p => p.id === pieceId);
  if (pieceIndex === -1) return null;

  const piece = currentPieces[pieceIndex];
  let dx = 0;
  let dy = 0;

  switch (direction) {
    case Direction.UP: dy = -1; break;
    case Direction.DOWN: dy = 1; break;
    case Direction.LEFT: dx = -1; break;
    case Direction.RIGHT: dx = 1; break;
  }

  const newX = piece.x + dx;
  const newY = piece.y + dy;

  if (!hasCollision(piece.id, newX, newY, piece.w, piece.h, currentPieces)) {
    piece.x = newX;
    piece.y = newY;
    return currentPieces;
  }

  return null;
};

export const checkWin = (pieces: Piece[]): boolean => {
  const caocao = pieces.find(p => p.type === PieceType.CAO_CAO);
  if (!caocao) return false;
  return caocao.x === WIN_TARGET.x && caocao.y === WIN_TARGET.y;
};

// Convert pieces to a simple string representation for AI
export const serializeBoard = (pieces: Piece[]): string => {
  const grid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('.'));
  
  pieces.forEach(p => {
    let char = 'S';
    if (p.type === PieceType.CAO_CAO) char = 'C';
    else if (p.type === PieceType.GENERAL_H) char = 'H';
    else if (p.type === PieceType.GENERAL_V) char = 'V';
    
    for(let i=0; i<p.h; i++) {
      for(let j=0; j<p.w; j++) {
        grid[p.y + i][p.x + j] = char;
      }
    }
  });

  return grid.map(row => row.join('')).join('\n');
};
