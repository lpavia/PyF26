interface AttemptsBarProps {
  total: number;
  used: number;
}

export default function AttemptsBar({ total, used }: AttemptsBarProps) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full transition-colors duration-300 ${
            i < used ? 'bg-fuchsia-500' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}
