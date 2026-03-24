import { getDigitVerdicts, type GuessRecord, type SecretNumber } from '../game/logic';

interface GuessRowProps {
  record: GuessRecord;
  secret: SecretNumber;
}

const verdictClass = {
  correct: 'bg-green-500 text-white',
  present: 'bg-yellow-400 text-black',
  absent: 'bg-slate-600 text-slate-300',
} as const;

export default function GuessRow({ record, secret }: GuessRowProps) {
  const verdicts = getDigitVerdicts(secret, record.guess);

  return (
    <div className="flex items-center gap-3 animate-slide-in">
      <div className="flex gap-2">
        {record.guess.split('').map((digit, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${verdictClass[verdicts[i]!]}`}
          >
            {digit}
          </div>
        ))}
      </div>
      <div className="text-lg font-mono font-bold text-fuchsia-300 min-w-[4rem]">
        {record.result || '–'}
      </div>
    </div>
  );
}
