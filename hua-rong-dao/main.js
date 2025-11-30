(() => {
  const COLS = 4;
  const ROWS = 5;

  const initialPieces = [
    { id: "cao", name: "曹操", w: 2, h: 2, x: 1, y: 0, kind: "boss" },
    { id: "guan", name: "关羽", w: 2, h: 1, x: 1, y: 2, kind: "wide" },
    { id: "zhang", name: "张飞", w: 1, h: 2, x: 0, y: 0, kind: "tall" },
    { id: "zhao", name: "赵云", w: 1, h: 2, x: 3, y: 0, kind: "tall" },
    { id: "ma", name: "马超", w: 1, h: 2, x: 0, y: 2, kind: "tall" },
    { id: "huang", name: "黄忠", w: 1, h: 2, x: 3, y: 2, kind: "tall" },
    { id: "bing1", name: "小卒", w: 1, h: 1, x: 1, y: 3, kind: "soldier" },
    { id: "bing2", name: "小卒", w: 1, h: 1, x: 2, y: 3, kind: "soldier" },
    { id: "bing3", name: "小卒", w: 1, h: 1, x: 0, y: 4, kind: "soldier" },
    { id: "bing4", name: "小卒", w: 1, h: 1, x: 3, y: 4, kind: "soldier" },
  ];

  let pieces = clonePieces(initialPieces);
  let moveHistory = [];
  let stepCount = 0;
  let dragState = null;
  let winShown = false;

  const board = document.getElementById("board");
  const undoBtn = document.getElementById("undoBtn");
  const resetBtn = document.getElementById("resetBtn");
  const stepLabel = document.getElementById("stepCount");
  const winLabel = document.getElementById("winLabel");
  const toast = document.getElementById("toast");

  function clonePieces(list) {
    return list.map((p) => ({ ...p }));
  }

  function buildBoard() {
    board.innerHTML = "";
    pieces.forEach((piece) => {
      const el = createPiece(piece);
      board.appendChild(el);
    });
    updateStatus();
  }

  function createPiece(piece) {
    const el = document.createElement("div");
    el.className = `piece ${piece.kind}`;
    el.dataset.id = piece.id;
    el.setAttribute("aria-label", piece.name);
    el.innerHTML = `<span class="tag">${piece.name}</span>`;
    setPosition(el, piece);
    el.addEventListener("pointerdown", onPointerDown);
    return el;
  }

  function setPosition(el, piece) {
    el.style.gridColumn = `${piece.x + 1} / span ${piece.w}`;
    el.style.gridRow = `${piece.y + 1} / span ${piece.h}`;
  }

  function updateBoard() {
    pieces.forEach((piece) => {
      let el = board.querySelector(`[data-id="${piece.id}"]`);
      if (!el) {
        el = createPiece(piece);
        board.appendChild(el);
      } else {
        setPosition(el, piece);
      }
    });
    updateStatus();
  }

  function updateStatus() {
    stepLabel.textContent = stepCount;
    undoBtn.disabled = moveHistory.length === 0;
    winLabel.hidden = !winShown;
  }

  function canPlace(piece, x, y, state = pieces) {
    if (x < 0 || y < 0 || x + piece.w > COLS || y + piece.h > ROWS) return false;
    return !state.some((other) => {
      if (other.id === piece.id) return false;
      const overlapX = x < other.x + other.w && x + piece.w > other.x;
      const overlapY = y < other.y + other.h && y + piece.h > other.y;
      return overlapX && overlapY;
    });
  }

  function movePiece(id, dirX, dirY, steps = 1) {
    if (!dirX && !dirY) return;
    const piece = pieces.find((p) => p.id === id);
    if (!piece) return;

    let moved = 0;
    let targetX = piece.x;
    let targetY = piece.y;
    for (let i = 0; i < steps; i += 1) {
      const nextX = targetX + dirX;
      const nextY = targetY + dirY;
      if (!canPlace(piece, nextX, nextY)) break;
      targetX = nextX;
      targetY = nextY;
      moved += 1;
    }

    if (!moved) return;
    moveHistory.push(clonePieces(pieces));
    piece.x = targetX;
    piece.y = targetY;
    stepCount += 1;
    winShown = false;
    updateBoard();
    checkWin(piece);
  }

  function undoMove() {
    if (!moveHistory.length) return;
    pieces = clonePieces(moveHistory.pop());
    stepCount = Math.max(0, stepCount - 1);
    winShown = false;
    updateBoard();
  }

  function resetGame() {
    pieces = clonePieces(initialPieces);
    moveHistory = [];
    stepCount = 0;
    winShown = false;
    updateBoard();
  }

  function checkWin(piece) {
    if (piece.id === "cao" && piece.x === 1 && piece.y === 3) {
      winShown = true;
      updateStatus();
      showToast("胜利！曹操顺利逃出。");
    }
  }

  function showToast(text) {
    toast.textContent = text;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  }

  function onPointerDown(event) {
    const target = event.currentTarget;
    event.preventDefault();
    dragState = {
      id: target.dataset.id,
      startX: event.clientX,
      startY: event.clientY,
    };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
  }

  function onPointerCancel() {
    cleanupPointer();
  }

  function onPointerUp(event) {
    if (!dragState) return;
    const id = dragState.id;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const maxDelta = Math.max(absX, absY);
    cleanupPointer();
    if (maxDelta < 8) return;

    const cellSize = board.clientWidth / COLS;
    const cells = Math.max(1, Math.round(maxDelta / cellSize));
    if (absX >= absY) {
      movePiece(id, Math.sign(dx), 0, cells);
    } else {
      movePiece(id, 0, Math.sign(dy), cells);
    }
  }

  function cleanupPointer() {
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    dragState = null;
  }

  undoBtn.addEventListener("click", undoMove);
  resetBtn.addEventListener("click", resetGame);

  buildBoard();
})();
