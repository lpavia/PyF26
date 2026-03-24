import { useState } from 'react';
import {
  generateSecret,
  deriveStatus,
  scoreGuess,
  isValidGuess,
  type GuessRecord,
  type GuessValue,
  type GameStatus,
  type SecretNumber,
} from '../game/logic';

const MAX_ATTEMPTS = 10;

interface UseGameReturn {
  secret: SecretNumber;
  records: GuessRecord[];
  status: GameStatus;
  maxAttempts: number;
  submitGuess: (guess: GuessValue) => void;
  resetGame: () => void;
}

export function useGame(): UseGameReturn {
  const [secret, setSecret] = useState<SecretNumber>(() => generateSecret());
  const [records, setRecords] = useState<GuessRecord[]>([]);

  const status = deriveStatus(records, MAX_ATTEMPTS);

  function submitGuess(guess: GuessValue) {
    if (status !== 'playing') return;
    if (!isValidGuess(guess)) return;
    const result = scoreGuess(secret, guess);
    setRecords(prev => [...prev, { guess, result }]);
  }

  function resetGame() {
    setSecret(generateSecret());
    setRecords([]);
  }

  return { secret, records, status, maxAttempts: MAX_ATTEMPTS, submitGuess, resetGame };
}
