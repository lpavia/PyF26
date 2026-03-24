import { useState, useCallback, useEffect } from 'react';
import { type GameStatus, type GuessValue } from '../game/logic';
import NumPad from './NumPad';

interface GuessInputProps {
  status: GameStatus;
  onSubmit: (guess: GuessValue) => void;
}

export default function GuessInput({ status, onSubmit }: GuessInputProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [shaking, setShaking] = useState(false);

  const disabled = status !== 'playing';
  const filled = digits.every(d => d !== '');
  const activeIndex = digits.findIndex(d => d === '');
  const highlightIndex = activeIndex === -1 ? 3 : activeIndex;

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const handleDigit = useCallback((d: string) => {
    if (disabled) return;
    setDigits(prev => {
      const idx = prev.findIndex(x => x === '');
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = d;
      return next;
    });
  }, [disabled]);

  const handleBackspace = useCallback(() => {
    if (disabled) return;
    setDigits(prev => {
      const next = [...prev];
      const lastFilled = next.map((x, i) => (x !== '' ? i : -1)).filter(i => i !== -1).pop();
      if (lastFilled === undefined) return prev;
      next[lastFilled] = '';
      return next;
    });
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    if (!filled || disabled) return;
    const guess = digits.join('');
    if (new Set(digits).size !== 4) {
      shake();
      return;
    }
    onSubmit(guess);
    setDigits(['', '', '', '']);
  }, [filled, disabled, digits, shake, onSubmit]);

  // Physical keyboard support for desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^\d$/.test(e.key)) handleDigit(e.key);
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, handleDigit, handleBackspace, handleSubmit]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex gap-3 ${shaking ? 'animate-shake' : ''}`}>
        {digits.map((digit, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center
              text-xl font-bold text-white bg-indigo-800 transition-colors
              ${i === highlightIndex && !disabled ? 'border-fuchsia-400' : 'border-indigo-400'}`}
          >
            {digit}
          </div>
        ))}
      </div>
      <NumPad
        onDigit={handleDigit}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        disabled={disabled}
        filled={filled}
      />
    </div>
  );
}
