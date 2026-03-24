import { useGame } from '../hooks/useGame';
import AttemptsBar from './AttemptsBar';
import GuessList from './GuessList';
import GuessInput from './GuessInput';
import GameOverOverlay from './GameOverOverlay';

export default function GameBoard() {
  const { secret, records, status, maxAttempts, submitGuess, resetGame } = useGame();

  return (
    <div className="relative w-full max-w-md bg-indigo-900 rounded-3xl shadow-2xl p-6 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-wide">Punto y Fama</h1>
        <p className="text-indigo-300 text-sm mt-1">Guess the 4-digit number</p>
      </div>

      <AttemptsBar total={maxAttempts} used={records.length} />

      <div className="min-h-[280px] flex flex-col justify-start">
        <GuessList records={records} secret={secret} />
      </div>

      <div className="border-t border-indigo-700 pt-4">
        <GuessInput status={status} onSubmit={submitGuess} />
      </div>

      <GameOverOverlay status={status} secret={secret} onReset={resetGame} />
    </div>
  );
}
