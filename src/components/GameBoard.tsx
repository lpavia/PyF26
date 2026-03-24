import { useGame } from '../hooks/useGame';
import AttemptsBar from './AttemptsBar';
import GuessList from './GuessList';
import GuessInput from './GuessInput';
import GameOverOverlay from './GameOverOverlay';

export default function GameBoard() {
  const { secret, records, status, maxAttempts, submitGuess, resetGame } = useGame();

  return (
    <div className="relative w-full max-w-md bg-indigo-900 rounded-3xl shadow-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Punto y Fama</h1>
          <p className="text-indigo-300 text-sm mt-1">Adivina el número de 4 dígitos</p>
        </div>
        <button
          onClick={resetGame}
          className="bg-indigo-700 hover:bg-indigo-600 active:scale-95 transition-all
            rounded-2xl px-4 py-2 text-sm font-semibold text-indigo-200"
        >
          Nueva partida
        </button>
      </div>

      <AttemptsBar total={maxAttempts} used={records.length} />

      <div className="min-h-[280px] flex flex-col justify-start">
        <GuessList records={records} />
      </div>

      <div className="border-t border-indigo-700 pt-4">
        <GuessInput status={status} onSubmit={submitGuess} />
      </div>

      <GameOverOverlay status={status} secret={secret} onReset={resetGame} />
    </div>
  );
}
