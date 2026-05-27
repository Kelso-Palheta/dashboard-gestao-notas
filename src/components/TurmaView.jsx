import { useState } from 'react';
import { TabelaNotas } from './TabelaNotas';
import { ImportModal } from './ImportModal';
import { MapaAnual } from './MapaAnual';
import { calcTotal, fmt, round2, somaMaxAtv, temNota, statusColor } from '../utils/calculos';

const statsByBimestre = (turma, bimestre) => {
  const b = turma.bimestres[String(bimestre)];
  if (!b) return { aprovados: 0, recuperacao: 0, reprovados: 0, semNota: 0 };
  const { atividades, notas, config } = b;
  let aprovados = 0, recuperacao = 0, reprovados = 0, semNota = 0;
  turma.alunos.forEach((al) => {
    const nota = notas[al.id];
    if (!temNota(nota, atividades)) {
      semNota++;
      return;
    }
    const t = calcTotal(nota.simulado, atividades, nota, config);
    const sc = statusColor(t, config);
    if (sc === 'good') aprovados++;
    else if (sc === 'warn') recuperacao++;
    else reprovados++;
  });
  return { aprovados, recuperacao, reprovados, semNota };
};

const StatChip = ({ label, value, color }) => (
  <div className={`flex flex-col items-center px-5 py-2.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${color}`}>
    <span className="font-bold text-xl font-mono tracking-tight tabular-nums">{value}</span>
    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 mt-0.5">{label}</span>
  </div>
);

export const TurmaView = ({
  turma,
  bimestre,
  onSetNota,
  onAddAtv,
  onRemoveAtv,
  onAddAlunos,
  onRemoveAluno,
  onRemoveAlunos,
  onUpdateConfig,
  onSetRecuperacao,
  onClearAtividadesNota,
  onClearAtividadesTurma
}) => {
  const [showImport, setShowImport] = useState(false);
  const [view, setView] = useState('bimestre');
  const stats = statsByBimestre(turma, bimestre);

  const handleSetNota = (alunoId, campo, valor) =>
    onSetNota(turma.id, bimestre, alunoId, campo, valor);

  const handleAddAtv = (nome, max) =>
    onAddAtv(turma.id, bimestre, nome, max);

  const handleRemoveAtv = (atvId) =>
    onRemoveAtv(turma.id, bimestre, atvId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-ink-600 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Turma {turma.nome}</h1>
            <span className="text-xs text-slate-400 font-mono mt-1">({turma.alunos.length} alunos)</span>
            {view === 'bimestre' ? (
              <span className="px-2.5 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500">
                {bimestre}&ordm; Bimestre
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500">
                Mapa Anual
              </span>
            )}
          </div>

          {view === 'bimestre' && (
            <div className="flex gap-3 mt-4">
              <StatChip
                label="Aprovados"
                value={stats.aprovados}
                color="border-green-400/20 text-green-600 bg-green-50 hover:border-green-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
              />
              <StatChip
                label="Recupera&ccedil;&atilde;o"
                value={stats.recuperacao}
                color="border-amber-400/20 text-amber-600 bg-amber-50 hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]"
              />
              <StatChip
                label="Reprovados"
                value={stats.reprovados}
                color="border-red-400/20 text-red-600 bg-red-50 hover:border-red-400/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]"
              />
              {stats.semNota > 0 && (
                <StatChip
                  label="Sem nota"
                  value={stats.semNota}
                  color="border-slate-300/50 text-slate-500 bg-slate-50 hover:border-slate-400/50"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'bimestre' ? 'anual' : 'bimestre')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]
              ${view === 'anual'
                ? 'bg-violet-500 border-violet-400/40 text-white hover:bg-violet-400 btn-3d-primary'
                : 'bg-white border-ink-600 text-ink-950 hover:bg-ink-700 hover:border-violet-300 btn-3d'}`}
          >
            <span className="font-semibold text-xs uppercase tracking-wider">
              {view === 'anual' ? 'Ver Bimestre' : 'Mapa Anual'}
            </span>
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-ink-700 border border-ink-600 hover:border-violet-300 rounded-xl text-sm text-ink-950 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] btn-3d"
          >
            <span className="font-semibold text-xs uppercase tracking-wider">Importar Alunos</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        {turma.alunos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-6xl opacity-20">&#128203;</div>
            <p className="text-slate-400">Nenhum aluno cadastrado nesta turma.</p>
            <button
              onClick={() => setShowImport(true)}
              className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 rounded-xl text-white text-sm font-medium transition-all duration-300 btn-3d-primary"
            >
              Importar lista de alunos
            </button>
          </div>
        ) : view === 'anual' ? (
          <MapaAnual
            turma={turma}
            onSetRecuperacao={onSetRecuperacao}
          />
        ) : (
          <TabelaNotas
            turma={turma}
            bimestre={bimestre}
            onSetNota={handleSetNota}
            onAddAtv={handleAddAtv}
            onRemoveAtv={handleRemoveAtv}
            onRemoveAluno={onRemoveAluno}
            onRemoveAlunos={onRemoveAlunos}
            onUpdateConfig={(cfg) => onUpdateConfig(turma.id, bimestre, cfg)}
            onClearAtividadesNota={onClearAtividadesNota}
            onClearAtividadesTurma={onClearAtividadesTurma}
          />
        )}
      </div>

      {showImport && (
        <ImportModal
          turma={turma}
          onConfirm={(nomes) => onAddAlunos(turma.id, nomes)}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
};
