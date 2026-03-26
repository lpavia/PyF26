interface HelpOverlayProps {
  onClose: () => void;
}

export default function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-3xl animate-scale-in backdrop-blur-sm z-10"
      onClick={onClose}
    >
      <div
        className="bg-indigo-800 border-2 border-indigo-400 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white text-center">¿Cómo se juega?</h2>

        <ul className="text-slate-200 text-sm flex flex-col gap-2">
          <li>
            El juego genera un número secreto de <span className="text-white font-semibold">4 dígitos sin repetir</span>.
          </li>
          <li>
            Tienes <span className="text-white font-semibold">10 intentos</span> para adivinarlo.
          </li>
          <li>
            Después de cada intento recibes pistas:
            <div className="flex flex-col gap-1.5 mt-2 ml-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-fuchsia-500 flex items-center justify-center text-xs font-extrabold text-white shrink-0">F</span>
                <span>Dígito correcto en la posición correcta.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center text-xs font-extrabold text-amber-900 shrink-0">•</span>
                <span>Dígito correcto pero en la posición equivocada.</span>
              </div>
            </div>
          </li>
          <li>
            Si un dígito no aparece como <span className="text-fuchsia-400 font-semibold">F</span> ni como <span className="text-amber-400 font-semibold">•</span>, no está en el número.
          </li>
        </ul>

        <button
          onClick={onClose}
          className="mt-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all
            rounded-2xl px-6 py-2 font-bold text-white text-sm self-center"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
