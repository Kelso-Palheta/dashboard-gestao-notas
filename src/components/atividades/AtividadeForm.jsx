import { useState } from 'react';

const BIMESTRES = [1, 2, 3, 4];

export const AtividadeForm = ({ turmas, onSave, onClose, initialData }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [enunciado, setEnunciado] = useState(initialData?.enunciado || '');
  const [gabarito, setGabarito] = useState(initialData?.gabarito || '');
  const [notaMaxima, setNotaMaxima] = useState(initialData?.notaMaxima?.toString() || '3.0');
  const [bimestre, setBimestre] = useState(initialData?.bimestre || 1);
  const [turmaIds, setTurmaIds] = useState(initialData?.turmaIds || []);
  const [dataEntrega, setDataEntrega] = useState(() => {
    if (initialData?.dataEntrega?.toDate) {
      return initialData.dataEntrega.toDate().toISOString().slice(0, 16);
    }
    // Default: 7 dias a partir de hoje às 23:59
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const toggleTurma = (id) => {
    setTurmaIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!titulo.trim()) { setErro('Título é obrigatório.'); return; }
    if (!enunciado.trim()) { setErro('Enunciado é obrigatório.'); return; }
    if (!gabarito.trim()) { setErro('Gabarito/rubrica é obrigatório para correção por IA.'); return; }
    if (turmaIds.length === 0) { setErro('Selecione pelo menos uma turma.'); return; }
    if (!dataEntrega) { setErro('Data de entrega é obrigatória.'); return; }

    const max = Number(notaMaxima);
    if (isNaN(max) || max < 0.1 || max > 10) { setErro('Nota máxima deve ser entre 0,1 e 10.'); return; }

    const alunosPorTurma = {};
    for (const tid of turmaIds) {
      const turma = turmas.find(t => t.id === tid);
      if (turma) {
        alunosPorTurma[tid] = turma.alunos || [];
      }
    }

    setSaving(true);
    try {
      await onSave({
        titulo: titulo.trim(),
        enunciado: enunciado.trim(),
        gabarito: gabarito.trim(),
        notaMaxima: max,
        bimestre,
        turmaIds,
        dataEntrega: new Date(dataEntrega),
        alunosPorTurma
      });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar atividade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-ink-600 max-h-[90vh] overflow-y-auto animate-card-in">
        <div className="p-5 border-b border-ink-600 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-950">
            {initialData ? 'Editar Atividade' : 'Nova Atividade'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-ink-950 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-ink-950 mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              placeholder="Ex: Redação sobre Amazônia"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all input-glow"
            />
          </div>

          {/* Enunciado */}
          <div>
            <label className="block text-xs font-semibold text-ink-950 mb-1">Enunciado *</label>
            <textarea
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              rows={5}
              placeholder="Descreva a atividade detalhadamente..."
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all resize-y input-glow"
            />
          </div>

          {/* Gabarito/Rubrica */}
          <div>
            <label className="block text-xs font-semibold text-ink-950 mb-1">
              Gabarito / Rubrica de Correção *
            </label>
            <textarea
              value={gabarito}
              onChange={(e) => setGabarito(e.target.value)}
              rows={4}
              placeholder="Critérios de correção, rubrica, pontos por seção... (confidencial — nunca exibido ao aluno)"
              className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-amber-400/50 transition-all resize-y"
            />
            <p className="text-[10px] text-amber-500 mt-1">
              Confidencial — apenas você e a IA verão este campo.
            </p>
          </div>

          {/* Nota Máxima + Bimestre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-950 mb-1">Nota Máxima *</label>
              <input
                type="number"
                value={notaMaxima}
                onChange={(e) => setNotaMaxima(e.target.value)}
                min="0.1"
                max="10"
                step="0.1"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all input-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-950 mb-1">Bimestre *</label>
              <div className="grid grid-cols-4 gap-1">
                {BIMESTRES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBimestre(b)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 border
                      ${bimestre === b
                        ? 'bg-violet-500 text-white border-violet-400/20'
                        : 'bg-ink-700 text-slate-400 hover:bg-ink-600 border-ink-600'}`}
                  >
                    {b}º
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Turmas */}
          <div>
            <label className="block text-xs font-semibold text-ink-950 mb-1">Turmas *</label>
            <div className="bg-ink-700 border border-ink-600 rounded-xl p-2 max-h-32 overflow-y-auto space-y-0.5">
              {turmas.length === 0 && (
                <p className="text-xs text-slate-400 p-2">Nenhuma turma cadastrada.</p>
              )}
              {turmas.map((t) => (
                <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={turmaIds.includes(t.id)}
                    onChange={() => toggleTurma(t.id)}
                    className="w-4 h-4 rounded border-ink-600 text-violet-500 focus:ring-violet-400/30"
                  />
                  <span className="text-sm text-ink-950">{t.nome}</span>
                  <span className="text-xs text-slate-400">({t.alunos.length} alunos)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data de Entrega */}
          <div>
            <label className="block text-xs font-semibold text-ink-950 mb-1">Data de Entrega *</label>
            <input
              type="datetime-local"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all input-glow"
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-500">{erro}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded-xl text-sm text-slate-500 font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl text-white text-sm font-semibold transition-all btn-3d-primary"
            >
              {saving ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
