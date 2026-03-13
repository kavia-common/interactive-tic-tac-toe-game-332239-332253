import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/**
 * Returns winning line indices if a player has won.
 * @param {Array<("X"|"O"|null)>} squares
 * @returns {number[]|null}
 */
function getWinningLine(squares) {
  const lines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return [a, b, c];
  }
  return null;
}

/**
 * True if all squares are filled.
 * @param {Array<("X"|"O"|null)>} squares
 */
function isBoardFull(squares) {
  return squares.every((s) => s !== null);
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");

  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winningLine = useMemo(() => getWinningLine(squares), [squares]);
  const winner = winningLine ? squares[winningLine[0]] : null;
  const isDraw = !winner && isBoardFull(squares);

  // When a win is detected we flip this "pulse" token so the win animation
  // reliably re-triggers (and does not re-trigger on every re-render).
  const lastWinnerRef = useRef(null);
  const [winPulse, setWinPulse] = useState(0);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Trigger win animation once per win (not on every render).
  useEffect(() => {
    if (winner && lastWinnerRef.current !== winner) {
      lastWinnerRef.current = winner;
      setWinPulse((p) => p + 1);
    }
    if (!winner) {
      lastWinnerRef.current = null;
    }
  }, [winner]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleSquareClick = (idx) => {
    // If game is over or square is occupied, ignore.
    if (winner || isDraw || squares[idx]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[idx] = xIsNext ? "X" : "O";
      return next;
    });
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    // Reset win pulse so a subsequent win always animates.
    setWinPulse(0);
    lastWinnerRef.current = null;
  };

  const statusText = useMemo(() => {
    if (winner) return `${winner} wins!`;
    if (isDraw) return "It's a draw.";
    return `Next player: ${xIsNext ? "X" : "O"}`;
  }, [winner, isDraw, xIsNext]);

  const statusTone = winner ? "success" : isDraw ? "neutral" : "info";

  return (
    <div className="App">
      <main className="page">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <section className="card" aria-label="Tic Tac Toe game">
          <header className="header">
            <div className="titleBlock">
              <h1 className="title">Tic Tac Toe</h1>
              <p className="subtitle">Local two‑player · X goes first</p>
            </div>

            <div className="controls">
              <button className="btn btnPrimary" onClick={restartGame}>
                Restart
              </button>
            </div>
          </header>

          <div className={`status status--${statusTone}`} role="status" aria-live="polite">
            <span className="statusDot" aria-hidden="true" />
            <span className="statusText">{statusText}</span>
          </div>

          <div className="boardWrap">
            <div className="board" role="grid" aria-label="3 by 3 board">
              {squares.map((value, idx) => {
                const isWinningSquare = winningLine ? winningLine.includes(idx) : false;
                const cellLabel = value
                  ? `Cell ${idx + 1}, ${value}`
                  : `Cell ${idx + 1}, empty`;

                const isDisabled = Boolean(winner || isDraw || value);
                const winningHint = isWinningSquare ? ", part of winning line" : "";

                return (
                  <button
                    key={idx}
                    type="button"
                    className={[
                      "square",
                      isWinningSquare ? "square--win" : "",
                      isWinningSquare && winner ? "square--winAnim" : "",
                    ].join(" ")}
                    // Changing the key on the winning squares forces the element to remount,
                    // which restarts CSS animations in a predictable way.
                    // Note: we include winner to avoid remounting on draws.
                    {...(isWinningSquare && winner
                      ? { key: `${idx}-win-${winner}-${winPulse}` }
                      : { key: idx })}
                    onClick={() => handleSquareClick(idx)}
                    role="gridcell"
                    aria-label={`${cellLabel}${winningHint}`}
                    aria-disabled={isDisabled}
                    data-win={isWinningSquare && winner ? "true" : "false"}
                  >
                    <span className={`mark ${value ? "mark--set" : ""}`}>{value ?? ""}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="footer">
            <div className="legend" aria-label="Game legend">
              <span className="pill pillX">X</span>
              <span className="pill pillO">O</span>
              <span className="legendText">
                Tap a square to place your mark. First to 3 in a row wins.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
