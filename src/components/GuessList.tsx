import { useEffect, useRef } from 'react';
import GuessRow from './GuessRow';
import { type GuessRecord } from '../game/logic';

interface GuessListProps {
  records: GuessRecord[];
}

export default function GuessList({ records }: GuessListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [records.length]);

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        ¡Haz tu primer intento!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full pr-1">
      {records.map((record, i) => (
        <GuessRow key={i} index={i + 1} record={record} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
