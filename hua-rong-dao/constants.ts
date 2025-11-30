import { Piece, PieceType } from './types';

export const GRID_ROWS = 5;
export const GRID_COLS = 4;

// Classic "Heng Dao Li Ma" Layout
export const INITIAL_LEVEL: Piece[] = [
  { id: 'cc', type: PieceType.CAO_CAO, label: '曹操', x: 1, y: 0, w: 2, h: 2, color: 'bg-red-600' },
  { id: 'zf', type: PieceType.GENERAL_V, label: '张飞', x: 0, y: 0, w: 1, h: 2, color: 'bg-amber-600' },
  { id: 'zy', type: PieceType.GENERAL_V, label: '赵云', x: 3, y: 0, w: 1, h: 2, color: 'bg-amber-600' },
  { id: 'mc', type: PieceType.GENERAL_V, label: '马超', x: 0, y: 2, w: 1, h: 2, color: 'bg-amber-600' },
  { id: 'gy', type: PieceType.GENERAL_H, label: '关羽', x: 1, y: 2, w: 2, h: 1, color: 'bg-emerald-700' },
  { id: 'hz', type: PieceType.GENERAL_V, label: '黄忠', x: 3, y: 2, w: 1, h: 2, color: 'bg-amber-600' },
  { id: 's1', type: PieceType.SOLDIER, label: '卒', x: 0, y: 4, w: 1, h: 1, color: 'bg-stone-600' },
  { id: 's2', type: PieceType.SOLDIER, label: '卒', x: 1, y: 3, w: 1, h: 1, color: 'bg-stone-600' },
  { id: 's3', type: PieceType.SOLDIER, label: '卒', x: 2, y: 3, w: 1, h: 1, color: 'bg-stone-600' },
  { id: 's4', type: PieceType.SOLDIER, label: '卒', x: 3, y: 4, w: 1, h: 1, color: 'bg-stone-600' },
];

export const WIN_TARGET = { x: 1, y: 3 }; // Top-left of Cao Cao must reach (1,3)
