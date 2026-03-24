import { useEffect, useRef } from 'react';
import GuessRow from './GuessRow';
import { type GuessRecord, type SecretNumber } from '../game/logic';

interface GuessListProps {
  records: GuessRecord[];
  secret: SecretNumber;
}

export default function GuessList({ records, secret }: GuessListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [records.length]);

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Make your first guess!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
      {records.map((record, i) => (
        <GuessRow key={i} record={record} secret={secret} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
