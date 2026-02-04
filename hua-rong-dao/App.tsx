import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, Piece as PieceType } from './types';
import { INITIAL_LEVEL } from './constants';
import { tryMovePiece, checkWin, clonePieces, serializeBoard } from './utils/gameLogic';
import GameBoard from './components/GameBoard';
import { Undo2, RefreshCw, Trophy, Bot } from 'lucide-react';

// Global API for AI control
declare global {
  interface Window {
    hrd: {
      getState: () => any;
      getBoard: () => string;
      move: (pieceId: string, direction: string) => boolean;
      executeMoves: (moves: string[]) => Promise<void>;
      reset: () => void;
      getPieces: () => any[];
    };
  }
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    pieces: clonePieces(INITIAL_LEVEL),
    moveCount: 0,
    isWon: false,
    history: [],
  });

  const [showApiPanel, setShowApiPanel] = useState(false);
  const gameStateRef = useRef(gameState);
  
  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize checks
  useEffect(() => {
    if (checkWin(gameState.pieces) && !gameState.isWon) {
      setGameState(prev => ({ ...prev, isWon: true }));
    }
  }, [gameState.pieces, gameState.isWon]);

  // Expose global API for AI control
  useEffect(() => {
    const directionMap: Record<string, Direction> = {
      'up': Direction.UP,
      'down': Direction.DOWN,
      'left': Direction.LEFT,
      'right': Direction.RIGHT,
      'UP': Direction.UP,
      'DOWN': Direction.DOWN,
      'LEFT': Direction.LEFT,
      'RIGHT': Direction.RIGHT,
    };

    window.hrd = {
      // Get full game state
      getState: () => ({
        pieces: gameStateRef.current.pieces.map(p => ({
          id: p.id,
          label: p.label,
          x: p.x,
          y: p.y,
          w: p.w,
          h: p.h,
        })),
        moveCount: gameStateRef.current.moveCount,
        isWon: gameStateRef.current.isWon,
      }),

      // Get ASCII board representation
      getBoard: () => serializeBoard(gameStateRef.current.pieces),

      // Get pieces list with labels
      getPieces: () => gameStateRef.current.pieces.map(p => ({
        id: p.id,
        label: p.label,
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
      })),

      // Execute a single move
      move: (pieceId: string, direction: string) => {
        const dir = directionMap[direction];
        if (!dir) {
          console.error(`Invalid direction: ${direction}. Use up/down/left/right`);
          return false;
        }

        const current = gameStateRef.current;
        if (current.isWon) {
          console.log('Game already won!');
          return false;
        }

        const newPieces = tryMovePiece(current.pieces, pieceId, dir);
        if (newPieces) {
          setGameState(prev => ({
            ...prev,
            pieces: newPieces,
            moveCount: prev.moveCount + 1,
            history: [...prev.history.slice(-49), clonePieces(prev.pieces)],
          }));
          return true;
        }
        console.log(`Move failed: ${pieceId} ${direction}`);
        return false;
      },

      // Execute multiple moves with delay
      executeMoves: async (moves: string[]) => {
        for (const move of moves) {
          const [pieceId, direction] = move.trim().split(/\s+/);
          const success = window.hrd.move(pieceId, direction);
          if (!success) {
            console.error(`Failed at move: ${move}`);
            break;
          }
          // Small delay for visual feedback
          await new Promise(r => setTimeout(r, 300));
        }
        console.log('Execution complete. Board state:', window.hrd.getBoard());
      },

      // Reset the game
      reset: () => {
        setGameState({
          pieces: clonePieces(INITIAL_LEVEL),
          moveCount: 0,
          isWon: false,
          history: [],
        });
        console.log('Game reset');
      },
    };

    console.log('🎮 华容道 AI API 已加载');
    console.log('可用命令:');
    console.log('  hrd.getBoard()        - 获取棋盘状态');
    console.log('  hrd.getPieces()       - 获取棋子列表');
    console.log('  hrd.move("cc","down") - 移动棋子 (cc=曹操)');
    console.log('  hrd.executeMoves(["cc down","gy left"]) - 批量执行');
    console.log('  hrd.reset()           - 重置游戏');
    console.log('棋子ID: cc=曹操, zf=张飞, zy=赵云, mc=马超, gy=关羽, hz=黄忠, s1-s4=卒');

    return () => {
      delete (window as any).hrd;
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'E' to export state to clipboard
      if (e.key === 'e' || e.key === 'E') {
        const state = JSON.stringify(window.hrd.getState(), null, 2);
        navigator.clipboard.writeText(state).then(() => {
          alert('棋盘状态已复制到剪贴板！');
        }).catch(() => {
          console.log('State:', state);
          alert('复制失败，请查看控制台');
        });
      }
      // 'B' to show board in console
      if (e.key === 'b' || e.key === 'B') {
        console.log('Current board:\n' + window.hrd.getBoard());
      }
      // 'A' to toggle API panel
      if (e.key === 'a' || e.key === 'A') {
        setShowApiPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                  onClick={() => setShowApiPanel(prev => !prev)}
                  className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 active:scale-95 transition-all hover:bg-stone-50"
                  title="AI API (按 A)"
              >
                  <Bot size={20} />
              </button>
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

        {/* API Panel */}
        {showApiPanel && (
          <div className="w-full max-w-sm mb-4 p-3 bg-stone-800 text-green-400 rounded-lg text-xs font-mono overflow-auto max-h-48">
            <div className="mb-2 text-green-300">🤖 AI API 已启用</div>
            <div className="text-stone-400">// 在控制台执行:</div>
            <div>hrd.getBoard()  <span className="text-stone-500">// 棋盘</span></div>
            <div>hrd.move("cc","down") <span className="text-stone-500">// 移动</span></div>
            <div>hrd.executeMoves([...])</div>
            <div className="mt-2 text-stone-400">// 快捷键:</div>
            <div>E=导出 B=打印棋盘 A=关闭面板</div>
            <div className="mt-2 text-stone-400">// 棋子ID:</div>
            <div>cc=曹操 gy=关羽 zf=张飞</div>
            <div>zy=赵云 mc=马超 hz=黄忠</div>
            <div>s1 s2 s3 s4=四卒</div>
            <pre className="mt-2 text-yellow-300 whitespace-pre">{serializeBoard(gameState.pieces)}</pre>
          </div>
        )}

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