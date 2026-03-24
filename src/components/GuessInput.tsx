import { useRef, useState, useCallback } from 'react';
import { type GameStatus, type GuessValue } from '../game/logic';

interface GuessInputProps {
  status: GameStatus;
  onSubmit: (guess: GuessValue) => void;
}

export default function GuessInput({ status, onSubmit }: GuessInputProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [shaking, setShaking] = useState(false);
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const inputRefs = [ref0, ref1, ref2, ref3];

  const disabled = status !== 'playing';
  const filled = digits.every(d => d !== '');

  const focusBox = useCallback((index: number) => {
    inputRefs[index]?.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const resetBoxes = useCallback(() => {
    setDigits(['', '', '', '']);
    focusBox(0);
  }, [focusBox]);

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    if (!char) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (index < 3) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        focusBox(index - 1);
      }
    } else if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < 3) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]!;
    }
    setDigits(newDigits);
    focusBox(Math.min(pasted.length, 3));
  };

  const handleSubmit = () => {
    if (!filled || disabled) return;
    const guess = digits.join('');
    // Check for duplicate digits
    if (new Set(digits).size !== 4) {
      shake();
      return;
    }
    onSubmit(guess);
    resetBoxes();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex gap-3 ${shaking ? 'animate-shake' : ''}`}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="text"
            inputMode="numeric"
            value={digit}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            maxLength={2}
            className="w-14 h-14 rounded-xl border-4 border-indigo-400 bg-indigo-800 text-white text-center text-2xl font-bold
              focus:outline-none focus:border-fuchsia-400 disabled:opacity-40 disabled:cursor-not-allowed
              caret-transparent"
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!filled || disabled}
        className="bg-fuchsia-500 hover:bg-fuchsia-400 active:scale-95 transition-all rounded-2xl px-8 py-3
          font-bold text-white text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        Guess
      </button>
    </div>
  );
}
