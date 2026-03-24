import { type GameStatus } from '../game/logic';

interface GameOverOverlayProps {
  status: GameStatus;
  secret: string;
  onReset: () => void;
}

export default function GameOverOverlay({ status, secret, onReset }: GameOverOverlayProps) {
  if (status === 'playing') return null;

  const won = status === 'won';

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-3xl animate-scale-in
      backdrop-blur-sm z-10">
      <div className={`rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl text-center
        ${won ? 'bg-green-900/90 border-2 border-green-400' : 'bg-red-900/90 border-2 border-red-400'}`}>
        <div className="text-4xl">{won ? '🎉' : '😢'}</div>
        <h2 className={`text-2xl font-bold ${won ? 'text-green-300' : 'text-red-300'}`}>
          {won ? 'You got it!' : 'Game Over!'}
        </h2>
        <p className="text-slate-200">
          The number was{' '}
          <span className="font-bold text-white text-xl tracking-widest">{secret}</span>
        </p>
        <button
          onClick={onReset}
          className={`mt-2 px-8 py-3 rounded-2xl font-bold text-white text-lg active:scale-95 transition-all
            ${won ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
