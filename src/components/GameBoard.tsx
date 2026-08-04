import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { useTheme } from '../hooks/useTheme';
import AttemptsBar from './AttemptsBar';
import GuessList from './GuessList';
import GuessInput from './GuessInput';
import GameOverOverlay from './GameOverOverlay';
import HelpOverlay from './HelpOverlay';
import ThemeToggle from './ThemeToggle';

export default function GameBoard() {
  const { secret, records, status, maxAttempts, resetCount, submitGuess, resetGame } = useGame();
  const { theme, toggleTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-indigo-900 transition-colors duration-300
      rounded-3xl shadow-2xl p-6 flex flex-col gap-4 h-[700px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950 dark:text-white tracking-wide">Punto y Fama</h1>
          <p className="text-indigo-500 dark:text-indigo-300 text-sm mt-1">Adivina el número de 4 dígitos</p>
        </div>
        <button
          onClick={resetGame}
          className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600
            active:scale-95 transition-all rounded-2xl px-4 py-2 text-sm font-semibold
            text-indigo-700 dark:text-indigo-200 shrink-0"
        >
          Nuevo juego
        </button>
      </div>

      <AttemptsBar total={maxAttempts} used={records.length} />

      <div className="flex-1 overflow-hidden">
        <GuessList records={records} />
      </div>

      <div className="border-t border-indigo-200 dark:border-indigo-700 pt-4">
        <GuessInput key={resetCount} status={status} onSubmit={submitGuess} />
      </div>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      <GameOverOverlay status={status} secret={secret} onReset={resetGame} />

      <a
        href="https://github.com/lpavia"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-4 text-[10px] text-indigo-500 hover:text-indigo-700
          dark:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        @lpavia
      </a>

      <div className="absolute bottom-1.5 right-4 flex items-center gap-2">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <button
          onClick={() => setShowHelp(true)}
          className="w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200
            dark:bg-indigo-700 dark:hover:bg-indigo-600
            active:scale-95 transition-all text-indigo-700 dark:text-indigo-300 font-bold text-sm"
          aria-label="Instrucciones"
        >
          ?
        </button>
      </div>
    </div>
  );
}
