import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Direction, Piece as PieceType } from './types';
import { INITIAL_LEVEL } from './constants';
import { tryMovePiece, checkWin, clonePieces } from './utils/gameLogic';
import GameBoard from './components/GameBoard';
import { Undo2, RefreshCw, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    pieces: clonePieces(INITIAL_LEVEL),
    moveCount: 0,
    isWon: false,
    history: [],
  });

  // Initialize checks
  useEffect(() => {
    if (checkWin(gameState.pieces) && !gameState.isWon) {
      setGameState(prev => ({ ...prev, isWon: true }));
    }
  }, [gameState.pieces, gameState.isWon]);

  const handleMove = useCallback((id: string, direction: Direction) => {
    if (gameState.isWon) return;

    setGameState(prev => {
      const newPieces = tryMovePiece(prev.pieces, id, direction);
      
      if (newPieces) {
        // Valid move
        const newHistory = [...prev.history, clonePieces(prev.pieces)];
        // Limit history to 50 moves to save memory
        if (newHistory.length > 50) newHistory.shift();

        return {
          ...prev,
          pieces: newPieces,
          moveCount: prev.moveCount + 1,
          history: newHistory,
        };
      }
      return prev;
    });
  }, [gameState.isWon]);

  const handleUndo = () => {
    if (gameState.history.length === 0 || gameState.isWon) return;
    
    setGameState(prev => {
      const previousPieces = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      return {
        ...prev,
        pieces: previousPieces,
        moveCount: Math.max(0, prev.moveCount - 1),
        history: newHistory,
        isWon: false // Reset win state if we undo out of it (unlikely but safe)
      };
    });
  };

  const handleReset = () => {
    // Direct reset without confirmation dialog to ensure it works on all mobile environments
    setGameState({
      pieces: clonePieces(INITIAL_LEVEL),
      moveCount: 0,
      isWon: false,
      history: [],
    });
  };

  return (
    <div className="h-screen w-screen bg-stone-100 text-stone-800 flex flex-col items-center overflow-hidden font-chinese">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-4">
        {/* Header */}
        <header className="text-center mb-4 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-1 drop-shadow-sm tracking-widest">华容道</h1>
          <p className="text-stone-600 text-sm md:text-base font-medium tracking-widest border-t border-b border-stone-300 py-1 inline-block">三国经典益智游戏</p>
        </header>

        {/* Stats Bar */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4 px-4 flex-shrink-0">
          <div className="flex flex-col">
             <span className="text-xs text-stone-500 font-bold">当前步数</span>
             <span className="text-3xl font-mono font-bold text-stone-800">{gameState.moveCount}</span>
          </div>
          
          <div className="flex gap-3">
              <button 
                  onClick={handleUndo} 
                  disabled={gameState.history.length === 0 || gameState.isWon}
                  className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all hover:bg-stone-50"
                  title="撤销"
              >
                  <Undo2 size={20} />
              </button>
              <button 
                  onClick={handleReset} 
                  className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 active:scale-95 transition-all hover:bg-stone-50"
                  title="重置"
              >
                  <RefreshCw size={20} />
              </button>
          </div>
        </div>

        {/* Game Board */}
        <GameBoard pieces={gameState.pieces} onMove={handleMove} />
      </div>

      {/* Footer Instructions */}
      <div className="pb-6 text-center text-stone-400 text-xs max-w-xs leading-relaxed flex-shrink-0">
         <p>滑动方块，协助曹操（红色）从下方出口逃脱。</p>
      </div>

      {/* Win Modal */}
      {gameState.isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fff9e6] rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center border-4 border-[#8b5a2b] transform transition-all scale-100">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 border-2 border-red-200">
                <Trophy size={32} />
            </div>
            <h2 className="text-4xl font-bold text-stone-800 mb-2">大获全胜！</h2>
            <p className="text-stone-600 mb-6 text-lg">
              曹操成功逃脱<br/>
              共耗时 <strong className="text-stone-900 font-mono text-xl">{gameState.moveCount}</strong> 步
            </p>
            <button 
              onClick={handleReset}
              className="w-full py-3 px-6 bg-[#d94e41] hover:bg-[#c33d31] text-white font-bold text-lg rounded-lg shadow-md active:transform active:translate-y-0.5 transition-colors tracking-widest border-b-4 border-[#9e3025]"
            >
              再战一局
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;