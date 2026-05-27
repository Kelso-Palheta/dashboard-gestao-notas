import { useState } from 'react';
import { NumCell } from './NumCell';
import { calcTotal, fmt, statusColor, somaMaxAtv, round2, temNota, titleCase } from '../utils/calculos';

const STATUS_STYLES = {
  good: 'text-green-600 bg-green-50 border border-green-400/20 font-semibold',
  warn: 'text-amber-600 bg-amber-50 border border-amber-400/20 font-semibold',
  bad:  'text-red-600 bg-red-50 border border-red-400/20 font-semibold'
};

const AddAtvForm = ({ onAdd, somaAtual, maxAtv }) => {
  const [nome, setNome] = useState('');
  const [max, setMax] = useState('');
  const dispLeft = round2(maxAtv - somaAtual);

  const submit = () => {
    const m = parseFloat(max.replace(',', '.'));
    if (!nome.trim() || isNaN(m) || m <= 0) return;
    onAdd(nome.trim(), m);
    setNome('');
    setMax('');
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da atividade"
        className="flex-1 bg-ink-700 border border-ink-600 rounded-lg px-3.5 py-2 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow"
      />
      <input
        value={max}
        onChange={(e) => setMax(e.target.value)}
        placeholder={`max (livre: ${fmt(dispLeft)})`}
        className="w-40 bg-ink-700/60 border border-slate-600/40 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-100 placeholder-slate-400 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow"
      />
      <button
        onClick={submit}
        className="px-5 py-2 bg-violet-500 hover:bg-violet-400 hover:scale-[1.03] active:scale-[0.97] rounded-lg text-sm text-white font-semibold transition-all duration-300 btn-3d-primary"
      >
        + Adicionar
      </button>
    </div>
  );
};

export const TabelaNotas = ({
  turma,
  bimestre,
  onSetNota,
  onAddAtv,
  onRemoveAtv,
  onRemoveAluno,
  onRemoveAlunos,
  onUpdateConfig,
  onClearAtividadesNota,
  onClearAtividadesTurma
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfig, setShowConfig] = useState(false);

  const bData = turma.bimestres[String(bimestre)] || { atividades: [], notas: {}, config: {} };
  const { atividades, notas, config = {} } = bData;

  const [cfgSimLanca, setCfgSimLanca] = useState(config?.simuladoMaxLanca ?? 10);
  const [cfgSimFinal, setCfgSimFinal] = useState(config?.simuladoMaxFinal ?? 5);
  const [cfgAtvFinal, setCfgAtvFinal] = useState(config?.atividadesMaxFinal ?? 5);
  const [cfgAprov, setCfgAprov] = useState(config?.mediaAprovacao ?? 7);
  const [cfgRecup, setCfgRecup] = useState(config?.mediaRecuperacao ?? 5);

  const somaMaxima = somaMaxAtv(atividades);
  const atvMax = config?.atividadesMaxFinal !== undefined ? Number(config.atividadesMaxFinal) : 5;
  const excede = somaMaxima > atvMax;

  const totaisTurma = turma.alunos
    .filter((al) => temNota(notas[al.id], atividades))
    .map((al) => {
      const nota = notas[al.id] || {};
      return calcTotal(nota.simulado, atividades, nota, config);
    });

  const media =
    totaisTurma.length > 0
      ? round2(totaisTurma.reduce((a, b) => a + b, 0) / totaisTurma.length)
      : null;

  const handleToggleSelectAll = () => {
    if (selectedIds.length === turma.alunos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(turma.alunos.map((al) => al.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRemoveSingle = (alunoId, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${titleCase(nome)}?`)) {
      onRemoveAluno(turma.id, alunoId);
      setSelectedIds((prev) => prev.filter((id) => id !== alunoId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir os ${selectedIds.length} alunos selecionados?`)) {
      onRemoveAlunos(turma.id, selectedIds);
      setSelectedIds([]);
    }
  };

  const handleClearSingleActivities = (alunoId, nome) => {
    if (window.confirm(`Tem certeza que deseja apagar apenas as notas de atividades do aluno ${titleCase(nome)}? (Nota do simulado será mantida)`)) {
      onClearAtividadesNota(turma.id, bimestre, alunoId);
    }
  };

  const handleClearBulkActivities = () => {
    if (window.confirm("Tem certeza que deseja apagar as notas de TODAS as atividades de TODOS os alunos neste bimestre? (Nota do simulado será mantida)")) {
      onClearAtividadesTurma(turma.id, bimestre);
    }
  };

  const handleSaveConfig = () => {
    const parseVal = (val, fallback) => {
      const parsed = parseFloat(String(val).replace(',', '.'));
      return isNaN(parsed) ? fallback : parsed;
    };
    onUpdateConfig({
      simuladoMaxLanca: parseVal(cfgSimLanca, 10),
      simuladoMaxFinal: parseVal(cfgSimFinal, 5),
      atividadesMaxFinal: parseVal(cfgAtvFinal, 5),
      mediaAprovacao: parseVal(cfgAprov, 7),
      mediaRecuperacao: parseVal(cfgRecup, 5)
    });
    setShowConfig(false);
  };

  return (
    <div>
      {/* Cabeçalho bimestre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Soma m&aacute;x. atividades:&nbsp;
            <span className={`font-mono font-semibold ${excede ? 'text-red-500' : 'text-ink-950'}`}>
              {fmt(somaMaxima)} / {fmt(atvMax)}
            </span>
          </span>
          {excede && (
            <span className="text-xs bg-red-50 border border-red-200 text-red-600 rounded-full px-2 py-0.5 font-semibold">
              ⚠ excede {fmt(atvMax)} pts
            </span>
          )}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium shadow"
            >
              🗑 Excluir selecionados ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-ink-700/50 hover:bg-ink-600 border border-slate-600/40 rounded-lg text-xs text-slate-200 hover:text-slate-50 transition-colors ml-2 font-medium btn-3d"
          >
            <span>⚙</span> Critérios
          </button>
          {turma.alunos.length > 0 && atividades.length > 0 && (
            <button
              onClick={handleClearBulkActivities}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-950/40 hover:border-red-500/40 rounded-lg text-xs transition-colors ml-2 font-medium shadow-[0_0_12px_rgba(239,68,68,0.05)] btn-3d"
            >
              <span>🧹</span> Limpar Atividades da Turma
            </button>
          )}
        </div>
        {media !== null && (
          <div className="text-sm text-slate-300">
            Média turma:&nbsp;
            <span className={`font-mono font-bold ${STATUS_STYLES[statusColor(media, config)].split(' ')[0]}`}>
              {fmt(media)}
            </span>
          </div>
        )}
      </div>

      {/* Painel de Configurações Collapsível */}
      {showConfig && (
        <div className="glass-card border border-slate-600/30 rounded-2xl p-5 mb-5 grid grid-cols-2 sm:grid-cols-5 gap-4 items-end transition-all">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Simulado Máx (Lançamento)</label>
            <input
              type="text"
              value={cfgSimLanca}
              onChange={(e) => setCfgSimLanca(e.target.value)}
              className="w-full bg-ink-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-slate-50 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Peso Simulado Final</label>
            <input
              type="text"
              value={cfgSimFinal}
              onChange={(e) => setCfgSimFinal(e.target.value)}
              className="w-full bg-ink-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-slate-50 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Peso Atividades Final</label>
            <input
              type="text"
              value={cfgAtvFinal}
              onChange={(e) => setCfgAtvFinal(e.target.value)}
              className="w-full bg-ink-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-slate-50 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Média Aprovação (Verde)</label>
            <input
              type="text"
              value={cfgAprov}
              onChange={(e) => setCfgAprov(e.target.value)}
              className="w-full bg-ink-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-slate-50 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow font-mono"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Média Recup. (Amarelo)</label>
              <input
                type="text"
                value={cfgRecup}
                onChange={(e) => setCfgRecup(e.target.value)}
                className="w-full bg-ink-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-xs text-slate-50 outline-none focus:bg-slate-700/50 focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow font-mono"
              />
            </div>
            <button
              onClick={handleSaveConfig}
              className="bg-violet-500 hover:bg-violet-400 hover:scale-[1.03] active:scale-[0.97] text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-all duration-300 h-[32px] self-end btn-3d-primary"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-slate-600/30 glass-card">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ink-700 border-b border-ink-600 text-left">
              <th className="px-3 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={turma.alunos.length > 0 && selectedIds.length === turma.alunos.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-ink-600 bg-white text-violet-500 focus:ring-violet-400"
                />
              </th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider min-w-[180px]">Aluno</th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-28">
                Simulado<br /><span className="text-slate-400 font-normal font-mono normal-case tracking-normal">(0–{fmt(config?.simuladoMaxLanca ?? 10)})</span>
              </th>
              {atividades.map((atv) => (
                <th key={atv.id} className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center group">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{atv.nome}</span>
                    <span className="text-slate-400 font-normal font-mono normal-case tracking-normal">(0–{fmt(atv.max)})</span>
                    <button
                      onClick={() => onRemoveAtv(atv.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-[10px] leading-none mt-0.5 transition-opacity"
                      title="Remover atividade"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-20">Total</th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {turma.alunos.map((al, idx) => {
              const nota = notas[al.id] || {};
              const total = calcTotal(nota.simulado, atividades, nota, config);
              const sc = statusColor(total, config);
              const temNotaAluno = temNota(nota, atividades);
 
              return (
                <tr
                  key={al.id}
                  className={`border-b border-slate-600/30 transition-all duration-300 ease-apple
                    ${idx % 2 === 0 ? 'bg-slate-700/10' : 'bg-transparent'}
                    hover:bg-slate-700/30`}
                >
                  <td className="px-3 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(al.id)}
                      onChange={() => handleToggleSelect(al.id)}
                      className="rounded border-slate-600/40 bg-ink-800 text-violet-500 focus:ring-violet-400"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-3 py-1.5 text-slate-50 font-medium">
                    {titleCase(al.nome)}
                  </td>
                  <td className="px-2 py-1">
                    <NumCell
                       value={nota.simulado ?? ''}
                       min={0}
                       max={config?.simuladoMaxLanca !== undefined ? Number(config.simuladoMaxLanca) : 10}
                       onChange={(v) => onSetNota(al.id, 'simulado', v)}
                     />
                  </td>
                  {atividades.map((atv) => (
                    <td key={atv.id} className="px-2 py-1">
                      <NumCell
                         value={nota[atv.id] ?? ''}
                         min={0}
                         max={atv.max}
                         onChange={(v) => onSetNota(al.id, atv.id, v)}
                       />
                     </td>
                   ))}
                   <td className="px-2 py-1.5 text-center">
                     {temNotaAluno ? (
                      <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${STATUS_STYLES[sc]}`}>
                        {fmt(total)}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs font-mono">—</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center flex items-center justify-center gap-1">
                    {atividades.length > 0 && (
                      <button
                        onClick={() => handleClearSingleActivities(al.id, al.nome)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                        title="Limpar notas de atividades deste aluno"
                      >
                        🧹
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveSingle(al.id, al.nome)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Excluir aluno"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adicionar atividade */}
      <AddAtvForm onAdd={onAddAtv} somaAtual={somaMaxima} maxAtv={atvMax} />
    </div>
  );
};
