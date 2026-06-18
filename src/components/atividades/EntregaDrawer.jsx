import { useState } from 'react';
import { fmt } from '../../utils/calculos';

export const EntregaDrawer = ({ entrega, notaMaxima, alunoNome, onOverride, onCorrigir, onClose }) => {
  const [editando, setEditando] = useState(false);
  const [novaNota, setNovaNota] = useState('');
  const notaAtual = entrega.notaRevisada ?? entrega.notaFinal;

  const handleSaveNota = () => {
    const val = Number(novaNota.replace(',', '.'));
    if (isNaN(val) || val < 0 || val > notaMaxima) {
      alert(`Nota deve ser entre 0 e ${notaMaxima}`);
      return;
    }
    onOverride(val);
    setEditando(false);
    setNovaNota('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-l border-ink-600 h-full overflow-y-auto animate-card-in">
        {/* Header */}
        <div className="p-5 border-b border-ink-600 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-ink-950">{alunoNome}</h3>
            <p className="text-xs text-slate-400">
              {entrega.submittedAt?.toDate
                ? entrega.submittedAt.toDate().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-ink-950 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Nota */}
          <div className="bg-ink-700 rounded-xl p-4 border border-ink-600">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs font-semibold text-ink-950 uppercase tracking-wider">Nota</span>
              <span className="text-xs text-slate-400">{notaMaxima.toFixed(1).replace('.', ',')} máx</span>
            </div>

            {editando ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="0,0"
                  className="flex-1 bg-white border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-950 outline-none focus:ring-1 focus:ring-violet-400/50 input-glow"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNota()}
                />
                <button
                  onClick={handleSaveNota}
                  className="px-3 py-2 bg-violet-500 hover:bg-violet-400 rounded-lg text-white text-xs font-semibold transition-all"
                >
                  OK
                </button>
                <button
                  onClick={() => { setEditando(false); setNovaNota(''); }}
                  className="px-3 py-2 bg-ink-700 hover:bg-ink-600 rounded-lg text-xs text-slate-400 transition-all"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-violet-500 tabular-nums">
                  {notaAtual != null ? fmt(notaAtual) : '—'}
                </span>
                <button
                  onClick={() => {
                    setNovaNota(notaAtual != null ? notaAtual.toString().replace('.', ',') : '');
                    setEditando(true);
                  }}
                  className="text-xs text-violet-400 hover:text-violet-500 font-medium ml-2"
                >
                  {notaAtual != null ? 'Alterar' : 'Atribuir'}
                </button>
              </div>
            )}

            {entrega.notaIA != null && (
              <p className="text-[10px] text-slate-400 mt-2">
                Nota IA: {entrega.notaIA.toFixed(1).replace('.', ',')}/10
                {entrega.notaRevisada != null && ` → Revisada: ${entrega.notaRevisada.toFixed(2).replace('.', ',')}`}
              </p>
            )}
            {entrega.revisadaPorId && (
              <p className="text-[10px] text-amber-500 mt-1">
                Nota revisada manualmente pelo professor
              </p>
            )}
          </div>

          {/* Ações de correção */}
          {(entrega.status === 'entregue' || entrega.status === 'erro_correcao') && (
            <button
              onClick={onCorrigir}
              className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 rounded-xl text-white text-sm font-semibold transition-all btn-3d-primary"
            >
              {entrega.status === 'erro_correcao' ? 'Tentar Correção Novamente' : 'Corrigir com IA'}
            </button>
          )}

          {/* Resposta do aluno */}
          <div>
            <h4 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-2">Resposta</h4>
            <div className="bg-ink-700 border border-ink-600 rounded-xl p-4">
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                {entrega.respostaTexto || '(sem resposta textual)'}
              </p>
            </div>
          </div>

          {/* Feedback da IA */}
          {entrega.feedback && (
            <div>
              <h4 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-2">Feedback da IA</h4>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{entrega.feedback}</p>
                {entrega.modeloIA && (
                  <p className="text-[10px] text-slate-400 mt-2">Modelo: {entrega.modeloIA}</p>
                )}
              </div>
            </div>
          )}

          {/* Critérios */}
          {entrega.criterios && entrega.criterios.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-2">Critérios</h4>
              <div className="bg-ink-700 border border-ink-600 rounded-xl divide-y divide-ink-600">
                {entrega.criterios.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-slate-500">{c.nome}</span>
                    <span className="text-xs font-mono text-ink-950 tabular-nums">
                      {c.pontos_obtidos}/{c.pontos_maximos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
