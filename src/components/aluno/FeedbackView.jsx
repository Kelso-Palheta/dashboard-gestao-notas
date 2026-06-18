export const FeedbackView = ({ entrega, notaMaxima }) => {
  const nota = entrega.notaRevisada ?? entrega.notaFinal;
  const statusLabel = entrega.status === 'corrigido'
    ? 'Corrigido por IA'
    : entrega.status === 'revisado'
      ? 'Revisado pelo professor'
      : 'Aguardando correção';

  return (
    <div className="animate-card-in">
      {/* Nota */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-1">
          <span className="text-4xl font-bold text-violet-500 tabular-nums">
            {nota != null ? nota.toFixed(2).replace('.', ',') : '—'}
          </span>
          <span className="text-sm text-slate-400">/ {notaMaxima.toFixed(1).replace('.', ',')}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{statusLabel}</p>
      </div>

      {/* Feedback */}
      {entrega.feedback && (
        <div className="bg-ink-700 border border-ink-600 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-2">Feedback</p>
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{entrega.feedback}</p>
        </div>
      )}

      {/* Critérios */}
      {entrega.criterios && entrega.criterios.length > 0 && (
        <div className="bg-ink-700 border border-ink-600 rounded-xl p-4">
          <p className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-3">Critérios</p>
          <div className="space-y-2">
            {entrega.criterios.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{c.nome}</span>
                <span className="text-xs font-mono text-ink-950 tabular-nums">
                  {c.pontos_obtidos}/{c.pontos_maximos}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resposta enviada */}
      {entrega.respostaTexto && (
        <div className="bg-ink-700 border border-ink-600 rounded-xl p-4 mt-4">
          <p className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-2">Sua resposta</p>
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{entrega.respostaTexto}</p>
        </div>
      )}
    </div>
  );
};
