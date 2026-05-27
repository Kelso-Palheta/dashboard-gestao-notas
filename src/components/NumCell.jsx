import { useState, useRef, useEffect } from 'react';
import { clamp } from '../utils/calculos';

export const NumCell = ({ value, min = 0, max = 10, onChange, disabled = false, placeholder = '—' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef(null);

  const displayVal =
    value === null || value === undefined || value === ''
      ? placeholder
      : Number(value).toFixed(2).replace('.', ',');

  const commit = () => {
    const raw = draft.replace(',', '.').trim();
    if (raw === '') {
      onChange('');
    } else {
      const n = parseFloat(raw);
      if (!isNaN(n)) onChange(clamp(n, min, max));
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.select();
    }
  }, [editing]);

  if (disabled) {
    return (
      <span className="font-mono text-sm text-slate-500 px-2">{displayVal}</span>
    );
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full bg-ink-900/60 border border-violet-500 rounded-lg px-2 py-0.5 font-mono text-sm text-slate-50 outline-none text-center transition-all duration-300 input-glow"
        style={{ minWidth: 56 }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value !== null && value !== undefined && value !== '' ? String(value).replace('.', ',') : '');
        setEditing(true);
      }}
      title="Clique para editar"
      className={`w-full px-2 py-1 font-mono text-sm rounded-lg border border-dashed tabular-nums
        ${value === null || value === undefined || value === ''
          ? 'border-slate-600/30 text-slate-400 hover:border-violet-500/50 hover:text-slate-200'
          : 'border-transparent hover:border-violet-500/50 text-slate-50 font-medium'}
        hover:bg-slate-700/50 transition-all duration-300 ease-apple text-center cursor-text`}
    >
      {displayVal}
    </button>
  );
};
