import { type GuessRecord } from '../game/logic';

interface GuessRowProps {
  record: GuessRecord;
}

export default function GuessRow({ record }: GuessRowProps) {
  const chips = record.result.split('');

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

      <div className="flex gap-1.5 min-w-[7rem] flex-wrap">
        {chips.length === 0 ? (
          <span className="text-slate-600 text-lg font-bold">—</span>
        ) : (
          chips.map((char, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shadow
                ${char === 'F'
                  ? 'bg-fuchsia-500 text-white'
                  : 'bg-amber-400 text-amber-900'
                }`}
            >
              {char === 'F' ? 'F' : '•'}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
