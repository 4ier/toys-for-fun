import React, { useCallback, useRef } from 'react';
import { Piece as PieceType, Direction } from '../types';

interface PieceProps {
  piece: PieceType;
  cellSize: number;
  onMoveAttempt: (id: string, direction: Direction) => void;
}

const Piece: React.FC<PieceProps> = ({ piece, cellSize, onMoveAttempt }) => {
  // Use refs to track drag state without re-rendering
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scrolling
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !startPos.current) return;
    
    isDragging.current = false;
    startPos.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !startPos.current) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const threshold = 15; // Minimum pixels to count as a swipe

    // If we passed the threshold, trigger move and reset start pos to allow continuous dragging?
    // For grid snapping, single step per swipe is usually cleaner.
    // Let's implement single step: once threshold crossed, fire event and stop dragging until release.
    
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        onMoveAttempt(piece.id, dx > 0 ? Direction.RIGHT : Direction.LEFT);
      } else {
        // Vertical
        onMoveAttempt(piece.id, dy > 0 ? Direction.DOWN : Direction.UP);
      }
      
      // Reset to prevent rapid firing (debounce effect via user interaction)
      // Actually, standard behavior often allows dragging. 
      // To simplify, we require lifting finger for next move or very large movement. 
      // Let's just consume the event.
      isDragging.current = false; 
    }
  };

  // Styles
  const style: React.CSSProperties = {
    width: piece.w * cellSize - 4, // -4 for gap
    height: piece.h * cellSize - 4,
    left: piece.x * cellSize + 2, // +2 for gap/centering
    top: piece.y * cellSize + 2,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Determine inner styling based on character
  const isCaoCao = piece.type === 'CAO_CAO';

  return (
    <div
      className={`absolute rounded-lg shadow-md flex items-center justify-center cursor-pointer select-none touch-none border-b-4 border-r-4 border-opacity-30 border-black active:scale-95 active:brightness-110 z-10 ${piece.color} text-white`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} // Safety
    >
      <div className={`flex flex-col items-center justify-center w-full h-full pointer-events-none`}>
        {/* Decorative inner border */}
        <div className="absolute inset-1 border border-white/20 rounded-md pointer-events-none"></div>
        
        <span className={`font-chinese font-bold ${isCaoCao ? 'text-4xl' : 'text-2xl'} drop-shadow-md`}>
          {piece.label}
        </span>
      </div>
    </div>
  );
};

export default Piece;
