import { type GuessRecord } from '../game/logic';

interface GuessRowProps {
  record: GuessRecord;
}

export default function GuessRow({ record }: GuessRowProps) {
  return (
    <div className="flex items-center gap-3 animate-slide-in">
      <div className="flex gap-2">
        {record.guess.split('').map((digit, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-slate-600 text-slate-300"
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
