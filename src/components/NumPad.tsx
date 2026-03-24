interface NumPadProps {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled: boolean;
  filled: boolean;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', '✓'],
];

export default function NumPad({ onDigit, onBackspace, onSubmit, disabled, filled }: NumPadProps) {
  const handleClick = (key: string) => {
    if (key === '⌫') onBackspace();
    else if (key === '✓') onSubmit();
    else onDigit(key);
  };

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {ROWS.flat().map((key) => {
        const isSubmit = key === '✓';
        const isBack = key === '⌫';
        const isDisabled = disabled || (isSubmit && !filled);

        return (
          <button
            key={key}
            onClick={() => handleClick(key)}
            disabled={isDisabled}
            className={`
              w-16 h-10 rounded-xl text-base font-bold active:scale-95 transition-all select-none
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              ${isSubmit
                ? 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white'
                : isBack
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-indigo-700 hover:bg-indigo-600 text-white'
              }
            `}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
