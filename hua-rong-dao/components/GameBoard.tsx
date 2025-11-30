import React, { useRef, useEffect, useState } from 'react';
import { Piece as PieceModel, Direction } from '../types';
import Piece from './Piece';
import { GRID_ROWS, GRID_COLS } from '../constants';

interface GameBoardProps {
  pieces: PieceModel[];
  onMove: (id: string, direction: Direction) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ pieces, onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);

  // Responsive cell size calculation
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Use clientWidth to exclude borders from the calculation
        // The container has an 8px border, so offsetWidth includes it, causing overflow if used.
        const width = containerRef.current.clientWidth;
        setCellSize(width / GRID_COLS);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const boardHeight = cellSize * GRID_ROWS;
  const borderSize = 16; // 8px top + 8px bottom

  return (
    <div className="w-full max-w-sm mx-auto p-4 flex-shrink-0">
      {/* The Grid Container */}
      <div 
        ref={containerRef}
        className="relative bg-[#d6c4a0] rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] border-8 border-[#8b5a2b] box-border"
        style={{ height: boardHeight + borderSize }}
      >
        {/* Background Grid Lines (Optional decoration) */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ 
               backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
               backgroundSize: `${cellSize}px ${cellSize}px`,
               margin: '0px'
             }}>
        </div>

        {/* Exit Marker */}
        <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-green-500/30 rounded-t-lg z-0"
            style={{ width: cellSize * 2 }}
        >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold font-chinese text-stone-700 tracking-widest drop-shadow-sm border border-stone-400/30 px-2 py-0.5 rounded bg-[#d6c4a0]/80">出口</span>
        </div>

        {/* Pieces Layer */}
        <div className="relative w-full h-full z-10">
            {pieces.map(piece => (
            <Piece
                key={piece.id}
                piece={piece}
                cellSize={cellSize}
                onMoveAttempt={onMove}
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;