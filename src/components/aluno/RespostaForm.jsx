import { useState } from 'react';

const MAX_CHARS = 5000;
const MIN_CHARS = 5;

export const RespostaForm = ({ onSubmit, loading }) => {
  const [texto, setTexto] = useState('');

  const podeEnviar = texto.trim().length >= MIN_CHARS && texto.length <= MAX_CHARS && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!podeEnviar) return;
    onSubmit(texto.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="animate-card-in">
      <div className="mb-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva sua resposta aqui..."
          rows={8}
          maxLength={MAX_CHARS}
          className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 focus:border-violet-300 transition-all duration-300 resize-y input-glow"
          disabled={loading}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-slate-400">
            {texto.trim().length < MIN_CHARS ? `Mínimo ${MIN_CHARS} caracteres` : ''}
          </span>
          <span className={`text-xs font-mono tabular-nums ${texto.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
            {texto.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!podeEnviar}
        className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] btn-3d-primary"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          'Enviar Resposta'
        )}
      </button>
    </form>
  );
};
