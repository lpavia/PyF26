export type SecretNumber = string;
export type GuessValue = string;
export type GuessResult = string;
export type Verdict = 'correct' | 'present' | 'absent';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface GuessRecord {
  guess: GuessValue;
  result: GuessResult;
}

export function generateSecret(): SecretNumber {
  const digits: string[] = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10).toString();
    if (!digits.includes(d)) digits.push(d);
  }
  return digits.join('');
}

export function isValidGuess(value: string): boolean {
  if (value.length !== 4) return false;
  if (!/^\d{4}$/.test(value)) return false;
  return new Set(value.split('')).size === 4;
}

export function scoreGuess(secret: SecretNumber, guess: GuessValue): GuessResult {
  let famas = 0;
  let puntos = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      famas++;
    } else if (secret.includes(guess[i]!)) {
      puntos++;
    }
  }
  return 'F'.repeat(famas) + '.'.repeat(puntos);
}

export function getDigitVerdicts(secret: SecretNumber, guess: GuessValue): Verdict[] {
  return Array.from({ length: 4 }, (_, i) => {
    if (guess[i] === secret[i]) return 'correct';
    if (secret.includes(guess[i]!)) return 'present';
    return 'absent';
  });
}

export function isWin(result: GuessResult): boolean {
  return result === 'FFFF';
}

export function deriveStatus(records: GuessRecord[], maxAttempts: number): GameStatus {
  if (records.length > 0 && isWin(records[records.length - 1]!.result)) return 'won';
  if (records.length >= maxAttempts) return 'lost';
  return 'playing';
}
