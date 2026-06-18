import { useState } from 'react';

const ALTERNATIVAS_IDS = ['A', 'B', 'C', 'D', 'E'];

function QuestaoDiscursiva({ numero, questao, resposta, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{numero}</span>
        <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Discursiva</span>
        <span className="text-xs text-slate-400 ml-auto">{questao.notaMaxima.toFixed(1).replace('.', ',')} pts</span>
      </div>

      <p className="text-sm text-ink-950 leading-relaxed mb-3 whitespace-pre-wrap">{questao.enunciado}</p>

      {questao.imagens?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {questao.imagens.map((img, i) => (
            <img key={i} src={img.url || img.base64} alt={`Imagem ${i + 1}`} className="max-h-48 rounded-lg border border-ink-600 object-contain" />
          ))}
        </div>
      )}

      <textarea
        value={resposta}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escreva sua resposta aqui..."
        rows={5}
        maxLength={5000}
        className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all resize-y"
      />
      <div className="flex justify-end mt-1">
        <span className="text-xs text-slate-400 font-mono">{resposta.length}/5000</span>
      </div>
    </div>
  );
}

function QuestaoObjetiva({ numero, questao, resposta, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{numero}</span>
        <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Objetiva</span>
        <span className="text-xs text-slate-400 ml-auto">{questao.notaMaxima.toFixed(1).replace('.', ',')} pts</span>
      </div>

      <p className="text-sm text-ink-950 leading-relaxed mb-3 whitespace-pre-wrap">{questao.enunciado}</p>

      {questao.imagens?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {questao.imagens.map((img, i) => (
            <img key={i} src={img.url || img.base64} alt={`Imagem ${i + 1}`} className="max-h-48 rounded-lg border border-ink-600 object-contain" />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {(questao.alternativas || []).map((alt) => (
          <label
            key={alt.id}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              resposta === alt.id
                ? 'bg-violet-50 border-violet-300'
                : 'bg-white border-ink-600 hover:border-violet-200 hover:bg-violet-50/40'
            }`}
          >
            <input
              type="radio"
              name={`questao-${questao.id}`}
              value={alt.id}
              checked={resposta === alt.id}
              onChange={() => onChange(alt.id)}
              className="mt-0.5 w-4 h-4 accent-violet-500 flex-shrink-0"
            />
            <span className="text-sm text-ink-950">
              <span className="font-bold text-violet-500 mr-1">{alt.id})</span>
              {alt.texto}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export const RespostaForm = ({ atividade, onSubmit, loading }) => {
  // Suporta formato novo (questoes[]) e legado (enunciado string)
  const questoes = atividade?.questoes?.length > 0
    ? atividade.questoes
    : [{ id: 'legacy', tipo: 'discursiva', enunciado: atividade?.enunciado || '', notaMaxima: atividade?.notaMaxima || 10, imagens: [] }];

  const [respostas, setRespostas] = useState({});

  const handleChange = (questaoId, tipo, resposta) => {
    setRespostas(prev => ({ ...prev, [questaoId]: { tipo, resposta } }));
  };

  const totalRespondidas = questoes.filter(q => {
    const r = respostas[q.id]?.resposta;
    return q.tipo === 'discursiva' ? r?.trim().length >= 5 : !!r;
  }).length;

  const podeEnviar = !loading && totalRespondidas === questoes.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!podeEnviar) return;
    // Formato legado: só uma questão discursiva
    if (questoes.length === 1 && questoes[0].id === 'legacy') {
      onSubmit(respostas['legacy']?.resposta || '', null);
    } else {
      onSubmit(null, respostas);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-card-in">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">{questoes.length} questão(ões) — {totalRespondidas}/{questoes.length} respondidas</p>
      </div>

      {questoes.map((q, i) =>
        q.tipo === 'objetiva'
          ? <QuestaoObjetiva key={q.id} numero={i + 1} questao={q} resposta={respostas[q.id]?.resposta || ''} onChange={(r) => handleChange(q.id, 'objetiva', r)} />
          : <QuestaoDiscursiva key={q.id} numero={i + 1} questao={q} resposta={respostas[q.id]?.resposta || ''} onChange={(r) => handleChange(q.id, 'discursiva', r)} />
      )}

      <button
        type="submit"
        disabled={!podeEnviar}
        className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl text-white text-sm font-semibold transition-all"
      >
        {loading
          ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enviando...</span>
          : `Enviar Respostas (${totalRespondidas}/${questoes.length})`
        }
      </button>
    </form>
  );
};
