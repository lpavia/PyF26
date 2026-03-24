import { type GuessRecord } from '../game/logic';

interface GuessRowProps {
  record: GuessRecord;
  index: number;
}

export default function GuessRow({ record, index }: GuessRowProps) {
  const chips = record.result.split('');

  return (
    <div className="flex items-center gap-2 animate-slide-in">
      <span className="text-xs font-bold text-slate-500 w-4 text-right shrink-0">{index}</span>
      <div className="flex gap-2">
        {record.guess.split('').map((digit, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold bg-slate-600 text-slate-300"
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
              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold shadow
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
